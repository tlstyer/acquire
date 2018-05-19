export interface UserDataProvider {
    createUser(username: string, password: string | null): Promise<number>;
    lookupUser(username: string): Promise<UserData | null>;
}

export interface UserData {
    userID: number;
    hasPassword: boolean;
    verifyPassword(password: string): boolean;
}

export class TestUserDataProvider implements UserDataProvider {
    nextUserID = 1;
    usernameToUserData: Map<string, TestUserData> = new Map();

    async createUser(username: string, password: string | null) {
        if (username === 'createUser error') {
            throw new Error('createUser error');
        }

        const userID = this.nextUserID++;
        this.usernameToUserData.set(username, new TestUserData(userID, password));
        return userID;
    }

    async lookupUser(username: string) {
        if (username === 'lookupUser error') {
            throw new Error('lookupUser error');
        }

        return this.usernameToUserData.get(username) || null;
    }
}

export class TestUserData implements UserData {
    hasPassword: boolean;

    constructor(public userID: number, private password: string | null) {
        this.hasPassword = password !== null;
    }

    verifyPassword(password: string) {
        return password === this.password;
    }
}
