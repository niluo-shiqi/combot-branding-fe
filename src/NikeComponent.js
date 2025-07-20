import React, {useEffect, useRef, useState} from 'react';
import logo from "./nikelogo.png";
import './Lulu.css';

const NikeComponent = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setInput] = useState('');
    const [conversationIndex, setConversationIndex] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [conversation, setConversation] = useState([]);
    const [messageTypeLog, setMessageTypeLog] = useState([]);
    const [classType, setClassType] = useState('');
    const [apiType, setApiType] = useState('');
    const [scenario, setScenario] = useState(null);
    const messagesEndRef = useRef(null);
    const BASE_URL = 'http://3.149.2.252:8000';

    useEffect(() => { // This useEffect hook runs once when the component mounts
        const fetchInitialMessage = async () => {
            try {
                // Randomly choose between Nike and Baseline API endpoints
                const isNike = Math.random() < 0.5;
                const apiUrl = isNike ? `${BASE_URL}/api/nike/initial/` : `${BASE_URL}/api/chatbot/initial/`;

                const response = await fetch(apiUrl, {
                    credentials: 'include' // Include cookies with the request
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setStartTime(Date.now());
                setMessages([{ text: data.message, sender: 'combot' }]); // Assuming 'data.message' is your initial message
                addMessageToConversation(data.message, 'combot');
                addMessageTypeToLog(data.messageType + (isNike ? ' Nike Initial' : ' Baseline Initial'));
                // Extract and store scenario from the response
                if (data.scenario) {
                    setScenario(data.scenario);
                }
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        fetchInitialMessage();
    }, []);
    const fetchClosingMessage = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/chatbot/closing/`, {
                credentials: 'include' // Include cookies with the request
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // Update the chat with the response from the closing endpoint
            setMessages(messages => [...messages, { text: data.message, sender: 'combot', isHtml: true }]);
            // Increment the conversation index
            setConversationIndex(conversationIndex + 1);
            addMessageToConversation(data.message,'combot');
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };
    useEffect(() => {
        // Scroll to the bottom every time messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessageToConversation = (message, sender) => {
        setConversation(prevConversation => [...prevConversation, { text: message, sender }]);
    };
    const addMessageTypeToLog = (messageType) => {
        setMessageTypeLog(prevConversation => [...prevConversation, { text: messageType }]);
    };
    const sendMessage = async (e) => {
        e.preventDefault();
        if (conversationIndex === 6 && !userInput.trim()) {
            setMessages(messages => [...messages, { text: "Please input a valid prolific id", sender: 'combot' }]);
            addMessageToConversation("Please input a valid prolific id", 'combot');
            return;
        }
        setMessages([...messages, { text: userInput, sender: 'user' }]);
        setInput('');
        addMessageToConversation(userInput, 'user');
        const endTime = Date.now();
        const timeSpent = Math.round((endTime - startTime) / 1000);

        let currentApiType = apiType;
        let apiUrl = '';

        // Determine the API type and corresponding URL for index 0 or 5
        if (conversationIndex === 0 || conversationIndex === 5) {
            currentApiType = Math.random() < 0.5 ? 'Nike' : 'Baseline';
            setApiType(currentApiType);
        }

        // Update the API URL based on the current API type
        if (currentApiType === 'Nike') {
            apiUrl = `${BASE_URL}/api/nike/`;
        } else if (currentApiType === 'Baseline') {
            apiUrl = `${BASE_URL}/api/chatbot/`;
        } else {
            console.error('Invalid API type:', currentApiType);
            return;
        }

        console.log(currentApiType);
        console.log(userInput);
        console.log(conversationIndex);
        console.log(classType);
        console.log(conversation);
        console.log(messageTypeLog);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies with the request
                body: JSON.stringify({
                    message: userInput,
                    index: conversationIndex,
                    timer: timeSpent,
                    classType: classType,
                    chatLog: conversation,
                    messageTypeLog: messageTypeLog,
                    scenario: scenario // Include scenario in the request data
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (conversationIndex === 6) {
                setMessages(messages => [...messages, { text: data.reply, sender: 'combot', isHtml: true }]);
            } else {
                setMessages(messages => [...messages, { text: data.reply, sender: 'combot' }]);
            }

            addMessageToConversation(data.reply, 'combot');
            addMessageTypeToLog(data.messageType + " " + currentApiType);
            setConversationIndex(data.index);
            setClassType(data.classType);

            if (conversationIndex === 5) {
                const delay = Math.random() * (4000 - 2000) + 3000;
                setTimeout(async () => {
                    await fetchClosingMessage();
                }, delay);
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    return (
        <div className="chatbot">
            <img className="logo" src={logo} alt="Nike Logo" />
            <div className="messages">
                {messages.map((message, index) => (
                    message.text && ( // Only proceed if message.text is not an empty string
                        <div key={index} className={`message ${message.sender}`}>
                            {message.isHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: message.text }} />
                            ) : (
                                message.text
                            )}
                        </div>
                    )
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form className="message-form" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default NikeComponent;
