export enum NuggetSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export const nuggetSizeMap = {
  SMALL: 3,
  MEDIUM: 2,
  LARGE: 1,
};

export enum IceMakerStatus {
  STANDBY = 'STANDBY',
  MAKING_ICE = 'MAKING_ICE',
  FULL = 'FULL',
  WASHING = 'WASHING',
  FINISHED_WASHING = 'FINISHED_WASHING',
  SCHEDULED = 'SCHEDULED',
}

export const statusMap = {
  STANDBY: 0,
  MAKING_ICE: 1,
  FULL: 2,
  WASHING: 3,
  FINISHED_WASHING: 4,
  SCHEDULED: 5,
};
