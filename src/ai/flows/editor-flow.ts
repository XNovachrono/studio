
/**
 * MOCK AI FLOW FOR PRESENTATION
 */
export async function generateEditorContent(input: { prompt: string }): Promise<string> {
    return `
        <h2>Contenido Sugerido</h2>
        <p>Esta es una respuesta simulada de la IA para tu solicitud: "<i>${input.prompt}</i>".</p>
        <ul>
            <li>Concepto 1: Definición detallada.</li>
            <li>Concepto 2: Aplicación práctica.</li>
            <li>Concepto 3: Ejemplos clave.</li>
        </ul>
        <p>Puedes editar este contenido libremente en el editor.</p>
    `;
}
