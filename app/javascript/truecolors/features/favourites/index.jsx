import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { debounce } from 'lodash';

import RefreshIcon from '@/material-icons/400-24px/refresh.svg?react';
import { fetchFavourites, expandFavourites } from 'truecolors/actions/interactions';
import { Account } from 'truecolors/components/account';
import ColumnHeader from 'truecolors/components/column_header';
import { Icon }  from 'truecolors/components/icon';
import { LoadingIndicator } from 'truecolors/components/loading_indicator';
import ScrollableList from 'truecolors/components/scrollable_list';
import Column from 'truecolors/features/ui/components/column';

const messages = defineMessages({
  refresh: { id: 'refresh', defaultMessage: 'Refresh' },
});

const mapStateToProps = (state, props) => ({
  accountIds: state.getIn(['user_lists', 'favourited_by', props.params.statusId, 'items']),
  hasMore: !!state.getIn(['user_lists', 'favourited_by', props.params.statusId, 'next']),
  isLoading: state.getIn(['user_lists', 'favourited_by', props.params.statusId, 'isLoading'], true),
});

class Favourites extends ImmutablePureComponent {

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    accountIds: ImmutablePropTypes.list,
    hasMore: PropTypes.bool,
    isLoading: PropTypes.bool,
    multiColumn: PropTypes.bool,
    intl: PropTypes.object.isRequired,
  };

  UNSAFE_componentWillMount () {
    if (!this.props.accountIds) {
      this.props.dispatch(fetchFavourites(this.props.params.statusId));
    }
  }

  handleRefresh = () => {
    this.props.dispatch(fetchFavourites(this.props.params.statusId));
  };

  handleLoadMore = debounce(() => {
    this.props.dispatch(expandFavourites(this.props.params.statusId));
  }, 300, { leading: true });

  render () {
    const { intl, accountIds, hasMore, isLoading, multiColumn } = this.props;

    if (!accountIds) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    }

    const emptyMessage = <FormattedMessage id='empty_column.favourites' defaultMessage='No one has favorited this post yet. When someone does, they will show up here.' />;

    return (
      <Column bindToDocument={!multiColumn}>
        <ColumnHeader
          showBackButton
          multiColumn={multiColumn}
          extraButton={(
            <button type='button' className='column-header__button' title={intl.formatMessage(messages.refresh)} aria-label={intl.formatMessage(messages.refresh)} onClick={this.handleRefresh}><Icon id='refresh' icon={RefreshIcon} /></button>
          )}
        />

        <ScrollableList
          scrollKey='favourites'
          onLoadMore={this.handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          bindToDocument={!multiColumn}
        >
          {accountIds.map(id =>
            <Account key={id} id={id} />,
          )}
        </ScrollableList>

        <Helmet>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(Favourites));
