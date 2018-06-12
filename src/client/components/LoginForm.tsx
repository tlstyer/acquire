import * as React from 'react';
import { ErrorCode } from '../../common/enums';
import { isASCII } from '../../common/helpers';
import * as commonStyle from '../common.css';
import { hackDoNotInterfereWithKeyboardShortcuts } from '../helpers';

const errorCodeToMessage = new Map([
    [ErrorCode.NotUsingLatestVersion, 'You are not using the latest version.'],
    [ErrorCode.InternalServerError, 'An error occurred during the processing of your request.'],
    [ErrorCode.InvalidMessageFormat, 'An error occurred during the processing of your request.'],
    [ErrorCode.InvalidUsername, 'Invalid username. Username must have between 1 and 32 ASCII characters.'],
    [ErrorCode.MissingPassword, 'Password is required.'],
    [ErrorCode.ProvidedPassword, 'Password is not set for this user.'],
    [ErrorCode.IncorrectPassword, 'Password is incorrect.'],
    [ErrorCode.InvalidMessage, 'An error occurred.'],
    [ErrorCode.CouldNotConnect, 'Could not connect to the server.'],
]);

export interface LoginFormProps {
    errorCode?: ErrorCode;
    username?: string;
    onSubmit: (username: string, password: string) => void;
}

interface LoginFormState {
    props: LoginFormProps;
    errorCode?: ErrorCode;
    username: string;
    password: string;
}

export class LoginForm extends React.PureComponent<LoginFormProps, LoginFormState> {
    constructor(props: LoginFormProps) {
        super(props);

        this.state = LoginForm._getDerivedStateFromProps(props);
    }

    static _getDerivedStateFromProps(props: LoginFormProps): LoginFormState {
        return {
            props,
            errorCode: props.errorCode,
            username: props.username !== undefined ? props.username : '',
            password: '',
        };
    }

    static getDerivedStateFromProps(nextProps: LoginFormProps, prevState: LoginFormState) {
        if (nextProps.username !== prevState.props.username || nextProps.errorCode !== prevState.props.errorCode) {
            return LoginForm._getDerivedStateFromProps(nextProps);
        } else if (nextProps.onSubmit !== prevState.props.onSubmit) {
            return { ...prevState, props: nextProps };
        } else {
            return null;
        }
    }

    render() {
        const { errorCode, username, password } = this.state;

        return (
            <form onKeyDown={hackDoNotInterfereWithKeyboardShortcuts} onSubmit={this.handleSubmit}>
                {errorCode !== undefined ? <div className={commonStyle.errorMessage}>{errorCodeToMessage.get(errorCode)}</div> : undefined}
                Username: <input type={'text'} value={username} onChange={this.handleChangeUsername} /> Password:{' '}
                <input type={'password'} value={password} onChange={this.handleChangePassword} /> <input type={'submit'} value={'Login'} />
            </form>
        );
    }

    handleChangeUsername = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({ username: event.currentTarget.value });
    };

    handleChangePassword = (event: React.FormEvent<HTMLInputElement>) => {
        this.setState({ password: event.currentTarget.value });
    };

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { username, password } = this.state;

        if (username.length === 0 || username.length > 32 || !isASCII(username)) {
            this.setState({ errorCode: ErrorCode.InvalidUsername });
        } else {
            this.setState({ errorCode: undefined });
            this.props.onSubmit(username, password);
        }
    };
}
