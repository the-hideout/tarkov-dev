import propertyFormatter from '../../modules/property-format';

import './index.css';

const skipProps = [
    'grid',
];

function PropertyList({properties}) {
    if(!properties){
        return null;
    }

    const allEntries = Object.entries(properties);

    allEntries.sort((a, b) => {
        return a[0].localeCompare(b[0]);
    });

    return <div
        className = 'property-list'
    >
        {
            allEntries.map((propertyObject) =>  {
                if(skipProps.includes(propertyObject[0])){
                    return null;
                }

                const [key, value] = propertyFormatter(...propertyObject);

                if(value.length === 0){
                    return null;
                }

                return <div
                    className = 'property-wrapper'
                    key = {key}
                >
                    <div>
                        {key}
                    </div>
                    <div>
                        {value}
                    </div>
                </div>;
            })
        }
    </div>
}

export default PropertyList;