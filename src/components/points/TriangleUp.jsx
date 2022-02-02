import { Component } from 'react';

class TriangleUp extends Component {
    render() {
        return (
            <svg
                {...this.props}
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0 300
                    L300 300
                    L150 0
                    Z"
                />
            </svg>
        );
    }
}

export default TriangleUp;
