import React, { Component, FC, Fragment } from 'react';
import { Router, RouteComponentProps } from '@reach/router';
import { constants } from '@polymathnetwork/new-shared';
import { POLYMATH_REGISTRY_ADDRESS_LOCAL } from '~/constants';
import { client } from '~/lib/polymathClient';
import { NotFoundPage, SdkTestPage } from '~/pages';

// TODO @RafaelVidaurre: Delete this temp component
class InitializeTemp extends Component<RouteComponentProps> {
  public state = {
    loading: true,
  };

  public async componentDidMount() {
    await client.connect();

    this.setState({ loading: false });
  }

  public render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }

    return <Fragment>{this.props.children}</Fragment>;
  }
}

export const Routes = () => (
  <Router>
    <InitializeTemp path="/">
      <SdkTestPage default />
    </InitializeTemp>
  </Router>
);
