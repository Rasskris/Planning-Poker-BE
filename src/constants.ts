export const PORT = 5000;

export const SERVER_ERROR_STATUS_CODE = 500;

export const SERVER_ERROR_MESSAGE = 'Something went wrong';

export const HALF_OF_USERS = 50;

export const FETCH_ERROR = 'Fetching failed';

export const SAVE_ERROR = 'Saving failed';

export const DELETE_ERROR = 'Delete failed';

export const UPDATE_ERROR = 'Update failed';

export const SUCCESS_TRUE = {
  success: true,
}

export const SUCCESS_FALSE = {
  success: false,
}

export const AUTO_ADMITED_TRUE = {
  isAutoAdmitedToGame: true,
};

export const AUTO_ADMITED_FALSE = {
  isAutoAdmitedToGame: false,
};

export const PENDING_DEALER_ANSWER_TRUE = {
  isPendingDealerAnswer: true,
};

export const PENDING_DEALER_ANSWER_FALSE = {
  isPendingDealerAnswer: false,
};

export const SCORE_TYPE_FN = 'fibonacciNumbers';

export const SCORE_TYPE_SHORT_FN = 'FN';

export const SCORE_VALUES_FN: Array<string> = ['1', '2', '3', '5', '8', 'coffee', 'unknown'];

export const ONE_VOTE = 1;

export const VALUE_UNKNOWN = 'unknown';

export enum ROUND_STATUS {
  NOT_STARTED = 'notStarted',
  STARTED = 'started',
  FINISHED = 'finished',
}

export const userRoles = {
  player: 'player',
  dealer: 'dealer',
  observer: 'observer',
};
