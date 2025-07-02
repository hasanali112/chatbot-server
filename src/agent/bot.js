// A simple chatbot function
const chatbot = (message) => {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        return 'Hello there! How can I help you today?';
    } else if (lowerCaseMessage.includes('how are you')) {
        return 'I am just a bot, but I am doing great! Thanks for asking.';
    } else if (lowerCaseMessage.includes('help')) {
        return 'You can ask me things like "hello", "how are you", or tell me what you need help with.';
    } else {
        return "I'm not sure how to respond to that. Can you try asking another way?";
    }
};

export default chatbot;
