import React, { Component, Dispatch, ReactNode } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { ActionType } from 'typesafe-actions';
import { Loading } from '@polymathnetwork/new-ui';
import { RootState } from '~/state/store';
import {
  createGetEntitiesFromCache,
  createGetCacheStatus,
} from '~/state/selectors';
import { fetchData } from '~/state/actions/dataRequests';
import { Fetcher, CacheStatus, FetchedData } from '~/types';

interface OwnProps {
  fetchers: Fetcher[];
  render(props: FetchedData): ReactNode;
}

interface StateProps {
  fetchedData: FetchedData;
  cache: CacheStatus[];
  loading: boolean;
}

interface DispatchProps {
  dispatch: Dispatch<ActionType<typeof fetchData>>;
}

type Props = OwnProps & StateProps & DispatchProps;

const mapStateToProps = () => {
  const entitiesSelector = createGetEntitiesFromCache();
  const cacheSelector = createGetCacheStatus();

  return (state: RootState, props: OwnProps): StateProps => {
    const fetchedData = entitiesSelector(state, props);
    const unfilteredCache = cacheSelector(state, props);

    const cache = _.filter(
      unfilteredCache,
      cacheStatus => cacheStatus.mustBeFetched
    );
    const loading = !!cache.length;

    return {
      fetchedData,
      cache,
      loading,
    };
  };
};

class DataFetcherBase extends Component<Props> {
  public getData() {
    const { dispatch, cache } = this.props;

    _.forEach(cache, cacheStatus => {
      const { args, requestKey } = cacheStatus;
      dispatch(
        fetchData({
          requestKey,
          args,
        })
      );
    });
  }

  public componentDidMount() {
    this.getData();
  }

  public componentWillUpdate() {
    this.getData();
  }

  public render() {
    const { render, fetchedData, loading } = this.props;

    if (loading) {
      return <Loading />;
    }

    return render(fetchedData);
  }
}

export const DataFetcher = connect(mapStateToProps)(DataFetcherBase);
