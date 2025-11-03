#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://y-pan.github.io/tiny-things/';
const README_PATH = path.join(__dirname, 'README.md');

// Manual entry definitions for files that need custom names, multiple entries, or specific parameters
// Each entry should have: { file, name, params (optional), useExtension (optional) }
const MANUAL_ENTRIES = [
    { file: 'lucky-shuffle.html', name: 'Lucky Shuffle', params: '?items=Sun,Mercury,Venus,Earth,Mars,Jupiter,Saturn,Uranus,Neptune&difficulty=2&interval=10', useExtension: false },
    { file: 'shuffle.html', name: 'Shuffle', params: '?items=Sun,Mercury,Venus,Earth,Mars,Jupiter,Saturn,Uranus,Neptune&shuffles=30&interval=40', useExtension: false },
    { file: 'password.html', name: 'Generate Password', params: '?length=14', useExtension: false },
    { file: 'game-of-life.html', name: "Game of Life - Gosper's Glider Gun", params: '?factor=1&grid=.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.66O1.53_.64O1.1O1.53_.54O2.6O2.12O2.42_.53O1.3O1.4O2.12O2.42_.42O2.8O1.5O1.3O2.56_.42O2.8O1.3O1.1O2.4O1.1O1.53_.52O1.5O1.7O1.53_.53O1.3O1.62_.54O2.64_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120_.120', useExtension: true },
    { file: 'game-of-life.html', name: 'Game of Life - Random', params: '?factor=1', useExtension: true },
    { file: 'game-of-life-builder.html', name: 'Game Of Life Builder', params: '?factor=1.5&grid=.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.26O1.13_.24O1.1O1.13_.14O2.6O2.12O2.2_.13O1.3O1.4O2.12O2.2_.2O2.8O1.5O1.3O2.16_.2O2.8O1.3O1.1O2.4O1.1O1.13_.12O1.5O1.7O1.13_.13O1.3O1.22_.14O2.24_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40_.40', useExtension: true },
    { file: 'tree.html', name: 'Tree Visualization', useExtension: true },
    { file: 'makePoints.html', name: 'Make Points', useExtension: true },
    { file: 'makePointsLabeled.html', name: 'Make Points Labeled', useExtension: true },
    { file: 'animation.html', name: 'Animation', useExtension: true },
].sort((a, b) => a.file.toLowerCase().localeCompare(b.file.toLowerCase(), {sensitivity: "base"}));

// Convert filename to proper capitalized name
function capitalizeName(filename) {
    // Remove .html extension
    let name = filename.replace(/\.html$/, '');
    
    // Handle camelCase (e.g., makePoints -> Make Points)
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Split by hyphens and capitalize each word
    const words = name.split(/[-_]/);
    
    // Capitalize first letter of each word
    const capitalizedWords = words.map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    
    return capitalizedWords.join(' ');
}

// Get URL for an entry
function getFileUrl(entry) {
    const { file, params = '', useExtension = true } = entry;
    const baseName = file.replace('.html', '');
    const baseUrl = BASE_URL + baseName;
    
    if (useExtension) {
        return baseUrl + '.html' + params;
    }
    return baseUrl + params;
}

// Create auto-generated entry for a file
function createAutoEntry(filename) {
    return {
        file: filename,
        name: capitalizeName(filename),
        params: '',
        useExtension: true
    };
}

// Get all HTML files in the directory
function getHtmlFiles() {
    const files = fs.readdirSync(__dirname)
        .filter(file => file.endsWith('.html'))
        .filter(file => file !== 'index.html') // Exclude index.html if it exists
        .sort(); // Sort alphabetically
    
    return files;
}

// Build list of all entries (manual + auto-generated)
function buildEntries() {
    const htmlFiles = getHtmlFiles();
    const manualFileSet = new Set(MANUAL_ENTRIES.map(e => e.file));
    
    // Start with manual entries (preserves order and multiple entries per file)
    const entries = [...MANUAL_ENTRIES];
    
    // Add auto-generated entries for files not covered by manual entries
    const autoEntries = htmlFiles
        .filter(file => !manualFileSet.has(file))
        .map(file => createAutoEntry(file))
        .sort((a, b) => a.file.toLowerCase().localeCompare(b.file.toLowerCase()));
    
    // Combine: manual entries first (in defined order), then auto-generated entries
    return [...entries, ...autoEntries];
}

// Generate README content
function generateReadme(entries) {
    let content = '# tiny-things\n\n';
    
    entries.forEach((entry, index) => {
        const url = getFileUrl(entry);
        const number = index + 1;
        
        content += `${number}. [${entry.name}](${url})\n`;
        
        // Add blank line after each entry (except the last)
        if (index < entries.length - 1) {
            content += '\n';
        }
    });
    
    // Add blank line at the end
    content += '\n';
    
    return content;
}

// Main function
function main() {
    try {
        const entries = buildEntries();
        
        if (entries.length === 0) {
            console.log('No HTML files found.');
            return;
        }
        
        console.log(`Found ${entries.length} entries:`);
        entries.forEach((entry, index) => {
            console.log(`  ${index + 1}. ${entry.file} -> ${entry.name}`);
        });
        
        const readmeContent = generateReadme(entries);
        
        // Write to README.md
        fs.writeFileSync(README_PATH, readmeContent, 'utf8');
        
        console.log('\n✓ README.md updated successfully!');
    } catch (error) {
        console.error('Error updating README.md:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { capitalizeName, createAutoEntry, getFileUrl, buildEntries };

