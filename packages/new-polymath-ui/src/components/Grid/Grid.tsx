import React from 'react';
import styled from 'styled-components';
import {
  gridGap,
  GridGapProps,
  gridAutoFlow,
  gridTemplateColumns,
  gridTemplateAreas,
  gridAutoColumns,
  gridAutoRows,
  alignItems,
  // @ts-ignore
  justifyItems,
  justifyContent,
  GridAutoFlowProps,
  GridTemplatesColumnsProps,
  GridTemplatesAreasProps,
  GridAutoColumnsProps,
  GridAutoRowsProps,
  AlignItemsProps,
  JustifyItemsProps,
  JustifyContentProps,
} from 'styled-system';

import { Box } from '~/components/Box';

export type GridProps = GridGapProps &
  GridAutoFlowProps &
  GridAutoFlowProps &
  GridTemplatesColumnsProps &
  GridTemplatesAreasProps &
  GridAutoColumnsProps &
  GridAutoRowsProps &
  AlignItemsProps &
  JustifyItemsProps &
  JustifyContentProps;

export const Grid = styled(Box)<GridProps>`
  display: grid;
  ${gridGap};
  ${gridAutoFlow};
  ${gridTemplateColumns};
  ${gridTemplateAreas};
  ${gridAutoColumns};
  ${gridAutoRows};
  ${alignItems};
  ${justifyContent};
  ${justifyItems};
`;

// TODO @grsmto: remove when https://github.com/pedronauck/docz/issues/337 is resolved
export const GridDocz = (props: GridProps) => {
  return <Grid {...props} />;
};

Grid.defaultProps = {
  gridGap: 'gridGap',
};
