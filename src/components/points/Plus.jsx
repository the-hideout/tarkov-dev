import { Component } from 'react';

class Plus extends Component {
    render() {
        return (
            <svg
                {...this.props}
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="
                    M125 0
                    L175 0
                    L175 125
                    L300 125
                    L300 175
                    L175 175
                    L175 300
                    L125 300
                    L125 175
                    L0   175
                    L0   125
                    L125 125
                    Z"
                />
            </svg>
        );
    }
}

export default Plus;
