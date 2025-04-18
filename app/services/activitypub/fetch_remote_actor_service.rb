# frozen_string_literal: true

class ActivityPub::FetchRemoteActorService < BaseService
  include JsonLdHelper
  include DomainControlHelper

  class Error < StandardError; end

  SUPPORTED_TYPES = %w(Application Group Organization Person Service).freeze

  # Does a WebFinger roundtrip on each call, unless `only_key` is true
  def call(uri, prefetched_body: nil, break_on_redirect: false, only_key: false, suppress_errors: true, request_id: nil)
    return if domain_not_allowed?(uri)
    return ActivityPub::TagManager.instance.uri_to_actor(uri) if ActivityPub::TagManager.instance.local_uri?(uri)

    @json = begin
      if prefetched_body.nil?
        fetch_resource(uri, true)
      else
        body_to_json(prefetched_body, compare_id: uri)
      end
    rescue Oj::ParseError
      raise Error, "Error parsing JSON-LD document #{uri}"
    end

    raise Error, "Error fetching actor JSON at #{uri}" if @json.nil?
    raise Error, "Unsupported JSON-LD context for document #{uri}" unless supported_context?
    raise Error, "Unexpected object type for actor #{uri} (expected any of: #{SUPPORTED_TYPES})" unless expected_type?
    raise Error, "Actor #{uri} has moved to #{@json['movedTo']}" if break_on_redirect && @json['movedTo'].present?
    raise Error, "Actor #{uri} has no 'preferredUsername', which is a requirement for Truecolors compatibility" if @json['preferredUsername'].blank?

    @uri      = @json['id']
    @username = @json['preferredUsername']
    @domain   = Addressable::URI.parse(@uri).normalized_host

    check_webfinger! unless only_key

    ActivityPub::ProcessAccountService.new.call(@username, @domain, @json, only_key: only_key, verified_webfinger: !only_key, request_id: request_id)
  rescue Error => e
    Rails.logger.debug { "Fetching actor #{uri} failed: #{e.message}" }
    raise unless suppress_errors
  end

  private

  def check_webfinger!
    webfinger = Webfinger.new("acct:#{@username}@#{@domain}").perform
    confirmed_username, confirmed_domain = split_acct(webfinger.subject)

    if @username.casecmp(confirmed_username).zero? && @domain.casecmp(confirmed_domain).zero?
      raise Error, "Webfinger response for #{@username}@#{@domain} does not loop back to #{@uri}" if webfinger.self_link_href != @uri

      return
    end

    webfinger = Webfinger.new("acct:#{confirmed_username}@#{confirmed_domain}").perform
    @username, @domain                   = split_acct(webfinger.subject)

    raise Webfinger::RedirectError, "Too many webfinger redirects for URI #{@uri} (stopped at #{@username}@#{@domain})" unless confirmed_username.casecmp(@username).zero? && confirmed_domain.casecmp(@domain).zero?
    raise Error, "Webfinger response for #{@username}@#{@domain} does not loop back to #{@uri}" if webfinger.self_link_href != @uri
  rescue Webfinger::RedirectError => e
    raise Error, e.message
  rescue Webfinger::Error => e
    raise Error, "Webfinger error when resolving #{@username}@#{@domain}: #{e.message}"
  end

  def split_acct(acct)
    acct.delete_prefix('acct:').split('@')
  end

  def supported_context?
    super(@json)
  end

  def expected_type?
    equals_or_includes_any?(@json['type'], SUPPORTED_TYPES)
  end
end
