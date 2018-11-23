import React, { Fragment } from 'react';
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';

import Icon from '../Icon';
import Paragraph from '../Paragraph';

import InfoIcon from '../../images/icons/Info';

const StyledTooltip = styled(ReactTooltip)`
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
  max-width: 15rem;
  background-color: white;
  padding: 1rem;
  border: 1px solid #dfe3e6;
  word-wrap: break-word;
  pointer-events: auto;
  border-radius: 0;
  transition: none;
  margin-left: 10px;

  &.show {
    opacity: 1;
  }

  &.place-top:before {
    border-top: 8px solid rgba(0, 0, 0, 0.05);
  }

  &.place-bottom:before {
    border-bottom: 8px solid #dfe3e6;
  }
`;

const StyledText = styled.span`
  vertical-align: middle;
  margin-right: 4px;
`;

const StyledIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.blue[1]};
`;

const Tooltip = ({ triggerText, children, id }) => (
  <Fragment>
    <StyledText>{triggerText}</StyledText>
    <StyledIcon
      data-tip
      data-for={id || triggerText}
      Icon={InfoIcon}
      width="16"
      height="16"
    />
    <StyledTooltip
      id={id || triggerText}
      delayHide={200}
      effect="solid"
      type="light"
      place="bottom"
    >
      <Paragraph bold>{triggerText}</Paragraph>
      {children}
    </StyledTooltip>
  </Fragment>
);

export default Tooltip;

Tooltip.defaultProps = {};
