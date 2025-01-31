// @flow

/**
 * NOTE @monitz87: This form should be refactored to use formik
 */
import React, { Component, Fragment } from 'react';
import { Form, Button, Link } from 'carbon-components-react';
import { Field, reduxForm } from 'redux-form';

import Paragraph from '../Paragraph';

import { CheckboxInput, TextInput } from '../../deprecated/components/inputs';
import { required, maxLength, email } from '../../deprecated/validate';

export const formName = 'signup';

const maxLength100 = maxLength(100);

type Props = {
  enableSubmit: boolean,
  handleSubmit: () => void,
};

class SignUpForm extends Component<Props> {
  render() {
    return (
      <Form onSubmit={this.props.handleSubmit}>
        <Field
          name="name"
          component={TextInput}
          label="Name"
          placeholder="Enter your name"
          validate={[required, maxLength100]}
        />
        <Field
          name="email"
          type="email"
          component={TextInput}
          label="Email"
          placeholder="Enter your email address"
          validate={[required, email]}
        />
        <div className="pui-sign-up-checkboxes">
          <Field
            name="acceptPrivacy"
            component={CheckboxInput}
            className="pui-checkbox-small-text"
            label={
              <Fragment>
                <Paragraph mb={0}>
                  I accept that Polymath may contact me via email to send me
                  updates on my token issuance process.
                  <br />
                  For more details, please consult our{' '}
                  <Link
                    target="_blank"
                    href="https://polymath.network/privacypolicy.html"
                  >
                    Privacy Policy
                  </Link>
                </Paragraph>
              </Fragment>
            }
          />
          <Field
            name="acceptTerms"
            component={CheckboxInput}
            className="pui-checkbox-small-text"
            label={
              <Paragraph mb={0}>
                I accept the&nbsp;
                <Link
                  target="_blank"
                  href="https://polymath.network/termsofservice.html"
                >
                  Terms of Service
                </Link>
              </Paragraph>
            }
          />
        </div>
        <Button type="submit" disabled={!this.props.enableSubmit}>
          CREATE ACCOUNT
        </Button>
      </Form>
    );
  }
}

export default reduxForm({
  form: formName,
})(SignUpForm);
