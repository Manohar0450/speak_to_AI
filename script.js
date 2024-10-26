let femaleVoices = [];
function loadVoices() {
    femaleVoices = window.speechSynthesis.getVoices().filter(voice =>
        voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman')
    );
    console.log("Voices loaded:", femaleVoices);
    if (femaleVoices.length === 0) {
        console.warn("No female voices found. Please try again later.");
    }
}
window.speechSynthesis.onvoiceschanged = loadVoices;
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    if (femaleVoices.length > 0) {
        utterance.voice = femaleVoices[0];
    } else {
        console.warn("No female voice available, using default voice.");
    }

    utterance.onend = () => {
        console.log("Speech synthesis finished.");
    };

    utterance.onerror = (event) => {
        console.error("Speech synthesis error: ", event.error);
    };

    window.speechSynthesis.speak(utterance);
}
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false; 
recognition.interimResults = false; 
document.getElementById('user-input').addEventListener('click', () => {
    recognition.start();
});
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('user-input').value = transcript; 
};

recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    alert("Speech recognition error: " + event.error);
};

recognition.onend = () => {
    console.log("Speech recognition service disconnected");
};

document.getElementById('generate-button').addEventListener('click', async function() {
    const userInput = document.getElementById('user-input').value.trim();
    const responseContainer = document.getElementById('response');
    const loadingIndicator = document.getElementById('loading');

    if (userInput) {
        loadingIndicator.classList.remove('hidden');
        responseContainer.textContent = '';

        try {
            const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBwQ267Mz_6jSKhRF7Kx-ybRKZxhsL_qbI";
            const body = {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: userInput }]
                    }
                ],
                generationConfig: {
                    temperature: 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 204,
                    stopSequences: []
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                ]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data = await response.json();
                const textResponse = data.candidates[0].content.parts[0].text;
                responseContainer.textContent = textResponse;
                speak(textResponse);
            } else {
                responseContainer.textContent = "Error: Unable to get response.";
            }
        } catch (error) {
            responseContainer.textContent = "Error: " + error.message;
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }
});

setTimeout(loadVoices, 1000); 
