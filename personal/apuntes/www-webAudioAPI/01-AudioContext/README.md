# Detalles

Las fuentes de sonido pueden crearse mediante 2 técnicas: 


``` javascript

    // Creación mediante constructor (método recomendado)
    const oscillatorNode = new OscillatorNode(audioContext, {
         type: "sine",
        frequency: 440,
    });
 
    // Creación mediante patrón fábrica
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 440;
```


