import { Component } from 'react';

class Square extends Component {
    render() {
        return (
            <svg
                {...this.props}
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M0 0,L0 300,L300 300,L300 0, Z" />
            </svg>
        );
    }
}

export default Square;
