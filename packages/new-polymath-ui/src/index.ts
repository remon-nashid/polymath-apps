import { theme } from './styles/theme';
import { SvgAccount } from './images/icons/Account';
import { SvgCalendar } from './images/icons/Calendar';
import { SvgCaretDown } from './images/icons/CaretDown';
import { SvgDot } from './images/icons/Dot';
import { SvgDownload } from './images/icons/Download';
import { SvgErc20 } from './images/icons/Erc20';
import { SvgDividends } from './images/icons/Dividends';
import { SvgDividendsOutline } from './images/icons/DividendsOutline';
import { SvgCheckmark } from './images/icons/Checkmark';
import { SvgChecklist } from './images/icons/Checklist';
import { SvgPen } from './images/icons/Pen';
import { SvgPlus } from './images/icons/Plus';
import { SvgPlusPlain } from './images/icons/PlusPlain';
import { SvgWarning } from './images/icons/Warning';

// Styles
export * from './styles';
export { theme };

// Primitives
export { Block } from './components/Block';
export { Box } from './components/Box';
export { Flex } from './components/Flex';
export { Grid } from './components/Grid';
export { GridRow } from './components/GridRow';
export { Heading } from './components/Heading';
export { InlineFlex } from './components/InlineFlex';
export { Paragraph } from './components/Paragraph';
export { PageWrap } from './components/PageWrap';

// Components
export { Button } from './components/Button';
export { ButtonSmall } from './components/ButtonSmall';
export { ButtonLarge } from './components/ButtonLarge';
export { ButtonFluid } from './components/ButtonFluid';
export { ButtonLink } from './components/ButtonLink';
export { Card } from './components/Card';
export { CardPrimary } from './components/CardPrimary';
export { CardFeatureState } from './components/CardFeatureState';
export { ErrorBoundary } from './components/ErrorBoundary';
export { Footer } from './components/Footer';
export { FormItem } from './components/FormItem';
export { Header } from './components/Header';
export { Icon } from './components/Icon';
export { IconCircled } from './components/IconCircled';
export { IconOutlined } from './components/IconOutlined';
export { IconButton } from './components/IconButton';
export { IconText } from './components/IconText';
export { Label } from './components/Label';
export { LabeledItem } from './components/LabeledItem';
export { Link } from './components/Link';
export { List } from './components/List';
export { Loading } from './components/Loading';
export { Text } from './components/Text';
export { ModalTransactionQueue } from './components/ModalTransactionQueue';
export {
  ModalConfirmTransactionQueue,
} from './components/ModalConfirmTransactionQueue';
export { Page } from './components/Page';
export { PageCentered } from './components/PageCentered';
export { ProgressIndicator } from './components/ProgressIndicator';
export { StickyTop } from './components/StickyTop';
export { Sidebar } from './components/Sidebar';
export { Tooltip } from './components/Tooltip';
export { TooltipIcon } from './components/TooltipIcon';
export { TooltipPrimary } from './components/TooltipPrimary';
export * from './components/Form';

// Icons
export const icons = {
  SvgAccount,
  SvgCalendar,
  SvgCaretDown,
  SvgDot,
  SvgDownload,
  SvgErc20,
  SvgDividends,
  SvgDividendsOutline,
  SvgCheckmark,
  SvgChecklist,
  SvgPen,
  SvgPlus,
  SvgPlusPlain,
  SvgWarning,
};
