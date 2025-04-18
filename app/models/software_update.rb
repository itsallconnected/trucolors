# frozen_string_literal: true

# == Schema Information
#
# Table name: software_updates
#
#  id            :bigint(8)        not null, primary key
#  version       :string           not null
#  urgent        :boolean          default(FALSE), not null
#  type          :integer          default("patch"), not null
#  release_notes :string           default(""), not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class SoftwareUpdate < ApplicationRecord
  self.inheritance_column = nil

  enum :type, { patch: 0, minor: 1, major: 2 }, suffix: :type

  scope :urgent, -> { where(urgent: true) }

  def gem_version
    Gem::Version.new(version)
  end

  def outdated?
    runtime_version >= gem_version
  end

  def pending?
    gem_version > runtime_version
  end

  class << self
    def check_enabled?
      Rails.configuration.x.truecolors.software_update_url.present?
    end

    def by_version
      all.sort_by(&:gem_version)
    end

    def pending_to_a
      return [] unless check_enabled?

      all.to_a.filter(&:pending?)
    end

    def urgent_pending?
      pending_to_a.any?(&:urgent?)
    end
  end

  private

  def runtime_version
    Truecolors::Version.gem_version
  end
end
