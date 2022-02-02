import { Component } from 'react';

class Circle extends Component {
    render() {
        return (
            <svg
                {...this.props}
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="
                        M 100, 100
                        m -75, 0
                        a 75,75 0 1,0 150,0
                        a 75,75 0 1,0 -150,0
                    "
                />
            </svg>
        );
    }
}

export default Circle;
