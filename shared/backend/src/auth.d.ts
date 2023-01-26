declare namespace Express {
  export interface Request {
    auth: import('shared/common/types').AuthInfo;
  }
}
