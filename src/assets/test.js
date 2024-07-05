import { EPub } from 'epubjs';
    import fs from 'fs';

const parseEPUB = async (filePath) => {
    const arrayBuffer = fs.readFileSync(filePath);

    const epub = new EPub(arrayBuffer);

    // Load the EPUB file
    await epub.opened;

    // Extract the text from the first chapter
    const firstSpineItem = epub.spine.get(0);
    const firstText = await firstSpineItem.load(null, epub.store);

    // Extract the first sentence
    const firstSentence = firstText.sections.map(section => section.text).join(' ').split('.')[0];

    console.log(`First Sentence: ${firstSentence}`);
};

// Replace 'path/to/your/epubfile.epub' with the actual file path
parseEPUB('./camus.epub');