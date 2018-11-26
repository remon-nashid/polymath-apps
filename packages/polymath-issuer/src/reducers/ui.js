// @flow
import { LOCATION_CHANGE } from 'connected-react-router';

export type UIState = {
  header: {
    variant: 'default' | 'transparent',
  },
  footer: {
    variant: 'default' | 'transparent',
  },
};

const defaultState: UIState = {
  header: {
    variant: 'default',
  },
  footer: {
    variant: 'default',
  },
  sidebar: {
    isVisible: false,
  },
};

export default (state: UIState = defaultState, action) => {
  if (action.type === LOCATION_CHANGE) {
    const pathname = action.payload.location.pathname;

    if (pathname === '/') {
      return {
        ...state,
        header: {
          variant: 'transparent',
        },
        footer: {
          variant: 'transparent',
        },
      };
    }

    if (pathname.match(/dashboard/)) {
      return {
        ...state,
        sidebar: {
          isVisible: true,
        },
      };
    }

    return defaultState;
  } else {
    return state;
  }
};
