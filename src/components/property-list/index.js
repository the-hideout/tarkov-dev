import propertyFormatter from '../../modules/property-format';

import './index.css';

const skipProps = [
    'Grid',
];

function PropertyList({properties}) {
    if(!properties){
        return null;
    }

    let allProperties = [];

    for(const key in properties){
        allProperties.push(
            propertyFormatter(key, properties[key])
        );
    }

    console.log(allProperties);

    allProperties.sort((a, b) => {
        return a[0].localeCompare(b[0]);
    });

    return <div
        className = 'property-list'
    >
        {
            allProperties.map((propertyObject) =>  {
                if(skipProps.includes(propertyObject[0])){
                    return null;
                }

                if(propertyObject[1].length === 0){
                    return null;
                }

                return <div
                    className = 'property-wrapper'
                    key = {propertyObject[0]}
                >
                    <div>
                        {propertyObject[1]}
                        <div
                            className='property-key-wrapper'
                        >
                            {propertyObject[0]}
                        </div>
                    </div>
                </div>;
            })
        }
    </div>
}

export default PropertyList;