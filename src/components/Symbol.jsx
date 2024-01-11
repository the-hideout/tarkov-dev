import { Component } from 'react';
import { Navigate } from 'react-router-dom';

import * as shapes from './points/index.js';

const SIZE = 2;

class Symbol extends Component {
    constructor() {
        super();

        this.state = {
            redirect: false,
        };

        this.handleOnClick = () => {
            if (this.props.link === false) {
                return true;
            }

            this.setState({
                redirect: true,
            });
        };
    }

    render() {
        if (this.state.redirect) {
            return <Navigate replace to={`/item/${this.props.datum.id}`} />;
        }

        const { x, y, datum } = this.props;
        const PointComponent = shapes[datum.symbol.type];

        return (
            <PointComponent
                onClick={this.handleOnClick}
                width={SIZE}
                height={SIZE}
                fill={datum.symbol.fill}
                x={x - SIZE / 2}
                y={y - SIZE / 2}
            />
        );
    }
}
export default Symbol;
