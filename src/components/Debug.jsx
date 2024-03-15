import { useState } from 'react';

function Debug() {
    const [itemId, setItemId] = useState('5eff09cd30a7dc22fd1ddfed');

    return (
        <div>
            <input
                type="text"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
            />
            <pre>Nothing here</pre>
        </div>
    );
}

export default Debug;
