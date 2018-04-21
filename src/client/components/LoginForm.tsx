import * as React from 'react';

import { isASCII } from '../../common/helpers';
import * as commonStyle from '../common.css';

export interface LoginFormProps {
    error?: string;
    username?: string;
    onSubmit: (username: string, password: string) => void;
}

interface LoginFormState {
    props: LoginFormProps;
    error?: string;
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
            error: props.error,
            username: props.username !== undefined ? props.username : '',
            password: '',
        };
    }

    static getDerivedStateFromProps(nextProps: LoginFormProps, prevState: LoginFormState) {
        if (nextProps.username !== prevState.props.username || nextProps.error !== prevState.props.error) {
            return LoginForm._getDerivedStateFromProps(nextProps);
        } else if (nextProps.onSubmit !== prevState.props.onSubmit) {
            return { ...prevState, props: nextProps };
        } else {
            return null;
        }
    }

    render() {
        const { error, username, password } = this.state;

        return (
            <form onSubmit={this.handleSubmit}>
                {error !== undefined ? <div className={commonStyle.errorMessage}>{error}</div> : undefined}
                Username: <input type="text" value={username} onChange={this.handleChangeUsername} /> Password:{' '}
                <input type="password" value={password} onChange={this.handleChangePassword} /> <input type="submit" value={'Login'} />
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
            this.setState({ error: 'Invalid username. Username must have between 1 and 32 ASCII characters.' });
        } else {
            this.setState({ error: undefined });
            this.props.onSubmit(username, password);
        }
    };
}
