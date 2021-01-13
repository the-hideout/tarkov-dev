import {useState} from 'react';

import items from '../Items';

function Debug() {
    const [itemId, setItemId] = useState('5eff09cd30a7dc22fd1ddfed');

    return <div>
        <input
            type="text"
            value={itemId}
            onChange={e => setItemId(e.target.value)}
        />
        <pre>
            {JSON.stringify(items[itemId], null, 4)}
        </pre>
    </div>;
};

export default Debug;
