import { Link } from 'react-router-dom';

function EmItemTag({ children }) {
    // console.log(props);
    const itemName = children[0].toLowerCase().replace(/ /g, '-');
    // ({node, ...props}) => <i style={{color: 'red'}} {...props} />
    return <Link to={`/item/${itemName}`}>{children}</Link>;
}

export default EmItemTag;
