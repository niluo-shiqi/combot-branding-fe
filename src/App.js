import React, { useState, useEffect } from 'react';
import NikeComponent from './NikeComponent';  // Adjust path as needed
import LuluComponent from './LuluComponent';  // Adjust path as needed

function App() {
    const [selectedNumber, setSelectedNumber] = useState(null);

    useEffect(() => {
        // Randomly choose 1 or 2
        const randomNumber = 1;
        setSelectedNumber(randomNumber);
    }, []);

    return (
        <div className="App">
            <div className="App-content">
                {/* Conditional rendering based on the random number */}
                {selectedNumber === 1 ? <NikeComponent /> : null}
                {selectedNumber === 2 ? <LuluComponent /> : null}
                {!selectedNumber && <div>Loading component...</div>}
            </div>
        </div>
    );
}

export default App;
