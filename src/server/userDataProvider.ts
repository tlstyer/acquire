import { SHA256 } from 'crypto-js';
import { PB_MessageToClient_LoginLogout_ResponseCode } from '../common/pb';

export interface UserDataProvider {
  createUser(username: string, password: string): Promise<UserDataProviderResponse>;
  lookupUser(username: string): Promise<UserDataProviderResponse>;
}

export class UserDataProviderResponse {
  constructor(
    public userData: UserData | undefined,
    public errorCode: PB_MessageToClient_LoginLogout_ResponseCode | undefined,
  ) {}
}

export interface UserData {
  username: string;
  userID: number;
  passwordHash: string;
  verifyPassword(password: string): boolean;
  verifyToken(token: string): boolean;
}

export class TestUserDataProvider implements UserDataProvider {
  nextUserID = 1;
  usernameToUserData = new Map<string, TestUserData>();

  async createUser(username: string, password: string) {
    if (username === 'createUser error') {
      return new UserDataProviderResponse(
        undefined,
        PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR,
      );
    }

    if (this.usernameToUserData.has(username)) {
      return new UserDataProviderResponse(
        undefined,
        PB_MessageToClient_LoginLogout_ResponseCode.USER_EXISTS,
      );
    }

    const userID = this.nextUserID++;
    const userData = new TestUserData(username, userID, getPasswordHash(username, password));
    this.usernameToUserData.set(username, userData);

    return new UserDataProviderResponse(userData, undefined);
  }

  async lookupUser(username: string) {
    if (username === 'lookupUser error') {
      return new UserDataProviderResponse(
        undefined,
        PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR,
      );
    }

    return new UserDataProviderResponse(this.usernameToUserData.get(username), undefined);
  }
}

export class TestUserData implements UserData {
  constructor(
    public username: string,
    public userID: number,
    public passwordHash: string,
  ) {}

  verifyPassword(password: string) {
    return getPasswordHash(this.username, password) === this.passwordHash;
  }

  verifyToken(token: string) {
    return token === this.passwordHash;
  }
}

export function getPasswordHash(username: string, password: string) {
  return SHA256('acquire ' + username + ' ' + password).toString();
}
