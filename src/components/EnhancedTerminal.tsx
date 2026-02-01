import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PROJECTS, SOCIALS } from '@/constants';
import { SITE } from '@/config';

// --- Types ---
interface TerminalLine {
    text: string;
    type: 'command' | 'output' | 'error' | 'info';
    isAnimated?: boolean;
    path?: string; // Captures path for 'command' types
}

interface VFSNode {
    name: string;
    type: 'file' | 'directory';
    content?: string;
    children?: VFSNode[];
    link?: string;
}

// --- Constants & Config ---
const COMMANDS = [
    'help', 'ls', 'cd', 'cat', 'open', 'whoami', 'date', 'clear', 'echo', 'socials', 'projects'
];

const COLORS = {
    user: '#5af78e',
    host: '#57c7ff',
    path: '#f1fa8c',
    command: '#ff6ac1',
    error: '#ff5c57',
    info: '#bd93f9',
    output: '#eff0f1'
};

// --- Component ---
const EnhancedTerminal: React.FC = () => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<TerminalLine[]>([]);
    const [currentPath, setCurrentPath] = useState<string[]>([]); // Array of directory names
    const [isTyping, setIsTyping] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const terminalRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // ... (rest of the VFS stays the same) ...

    // --- Virtual File System (VFS) ---
    const vfs: VFSNode = useMemo(() => {
        return {
            name: '~',
            type: 'directory',
            children: [
                {
                    name: 'projects',
                    type: 'directory',
                    children: PROJECTS.map(p => ({
                        name: p.name.toLowerCase().replace(/\s+/g, '-'),
                        type: 'file',
                        content: `${p.name}: ${p.description}`,
                        link: p.link
                    }))
                },
                {
                    name: 'about.md',
                    type: 'file',
                    content: `Name: ${SITE.author}\nBio: ${SITE.desc}\nRole: Software Engineer II at Softway.`
                },
                {
                    name: 'posts',
                    type: 'directory',
                    children: [
                        { name: 'latest-post.txt', type: 'file', content: 'Run `open blog` to check out the latest posts!' }
                    ]
                },
                {
                    name: 'tags',
                    type: 'directory',
                    children: [
                        { name: 'tech', type: 'directory', children: [] },
                        { name: 'life', type: 'directory', children: [] }
                    ]
                }
            ]
        };
    }, []);

    // --- Helper: Get current directory node ---
    const getCurrentNode = (path: string[]): VFSNode => {
        let node = vfs;
        for (const segment of path) {
            const child = node.children?.find(c => c.name === segment);
            if (child && child.type === 'directory') {
                node = child;
            }
        }
        return node;
    };

    const addLine = (line: TerminalLine | TerminalLine[]) => {
        const lines = Array.isArray(line) ? line : [line];
        setHistory(prev => [...prev, ...lines]);
    };

    const typeOutput = async (text: string | string[], type: TerminalLine['type'] = 'output') => {
        const lines = Array.isArray(text) ? text : text.split('\n');
        setIsTyping(true);

        for (const line of lines) {
            addLine({ text: line, type, isAnimated: true });
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        setIsTyping(false);
    };

    // --- Initial Welcome ---
    useEffect(() => {
        const init = async () => {
            await typeOutput([
                'System v3.0 stable initialized...',
                'Welcome to shubham@portfolio.',
                'Type "help" to list available commands.'
            ], 'info');

            const initialCmd = 'echo type `help` for site commands';
            let i = 0;
            setIsTyping(true);
            const interval = setInterval(() => {
                if (i < initialCmd.length) {
                    setInput(prev => initialCmd.slice(0, i + 1));
                    i++;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        handleCommand(initialCmd);
                        setInput('');
                        setIsTyping(false);
                    }, 400);
                }
            }, 30);
        };
        init();
    }, []);

    useEffect(() => {
        if (terminalRef.current) {
            const observer = new MutationObserver(() => {
                terminalRef.current!.scrollTop = terminalRef.current!.scrollHeight;
            });
            observer.observe(terminalRef.current, {
                childList: true,
                subtree: true,
                characterData: true
            });
            return () => observer.disconnect();
        }
    }, [isCollapsed]); // Re-init when visibility changes

    useEffect(() => {
        if (!isTyping && inputRef.current) {
            inputRef.current.focus({ preventScroll: true });
        }
    }, [isTyping, isCollapsed]);

    const handleCommand = async (fullCmd: string) => {
        const parts = fullCmd.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        const pathStr = `~${currentPath.length > 0 ? '/' + currentPath.join('/') : ''}`;
        addLine({ text: fullCmd, type: 'command', path: pathStr });

        switch (cmd) {
            case 'help':
                await typeOutput([
                    'Available commands:',
                    '  ls [dir]        - List directory contents',
                    '  projects        - View projects in detailed format',
                    '  cd [dir]        - Change directory',
                    '  cat [file]      - Show file content',
                    '  open [target]   - Open project, site page, or social link',
                    '  whoami          - About me',
                    '  socials         - List all social links',
                    '  date            - Show current date/time',
                    '  clear           - Clear terminal',
                    '  echo [text]     - Output text'
                ]);
                break;

            case 'projects':
                const projectOutput: string[] = [];
                PROJECTS.forEach(p => {
                    const desc = p.description;
                    const words = desc.split(' ');
                    const lines: string[] = [];
                    let currentLine = '';

                    words.forEach(word => {
                        if ((currentLine + word).length > 60) {
                            lines.push(currentLine.trim());
                            currentLine = word + ' ';
                        } else {
                            currentLine += word + ' ';
                        }
                    });
                    lines.push(currentLine.trim());

                    projectOutput.push(`${p.name} - ${lines[0]}`);
                    if (lines.length > 1) {
                        projectOutput.push(`  ├─ ${lines[1]}`);
                        for (let i = 2; i < lines.length; i++) {
                            projectOutput.push(`  │  ${lines[i]}`);
                        }
                        projectOutput.push(`  └─ ${p.tech.join(', ')}`);
                    } else {
                        projectOutput.push(`  └─ ${p.tech.join(', ')}`);
                    }
                    projectOutput.push('');
                });
                await typeOutput(projectOutput);
                break;

            case 'ls':
                const targetNode = args.length > 0 ? getCurrentNode([...currentPath, args[0]]) : getCurrentNode(currentPath);
                if (targetNode.children) {
                    const contents = targetNode.children.map(c => c.type === 'directory' ? `${c.name}/` : c.name).join('  ');
                    await typeOutput(contents || '(empty directory)');

                    if (targetNode.name === 'projects' || (args[0] === 'projects' && currentPath.length === 0)) {
                        await typeOutput([
                            '',
                            'Run `open project-name` to open the project link',
                            'Run `open projects` to open projects page'
                        ], 'info');
                    }
                } else {
                    await typeOutput(`ls: no such directory: ${args[0]}`, 'error');
                }
                break;

            case 'cd':
                const dir = args[0] || '~';
                if (dir === '~') {
                    setCurrentPath([]);
                } else if (dir === '..') {
                    setCurrentPath(prev => prev.slice(0, -1));
                } else {
                    const segments = dir.split('/').filter(s => s && s !== '.');
                    let tempPath = [...currentPath];
                    let valid = true;

                    for (const segment of segments) {
                        if (segment === '..') {
                            tempPath.pop();
                            continue;
                        }
                        const node = getCurrentNode(tempPath);
                        const child = node.children?.find(c => c.name === segment && c.type === 'directory');
                        if (child) {
                            tempPath.push(segment);
                        } else {
                            valid = false;
                            break;
                        }
                    }

                    if (valid) setCurrentPath(tempPath);
                    else await typeOutput(`cd: no such directory: ${dir}`, 'error');
                }
                break;

            case 'cat':
                if (args.length === 0) {
                    await typeOutput('cat: missing file operand', 'error');
                    break;
                }
                const fileNode = getCurrentNode(currentPath).children?.find(c => c.name === args[0] && c.type === 'file');
                if (fileNode) {
                    await typeOutput(fileNode.content || '');
                } else {
                    await typeOutput(`cat: ${args[0]}: No such file`, 'error');
                }
                break;

            case 'open':
                const target = args.join(' ').toLowerCase();
                if (!target) {
                    await typeOutput('Usage: open [project-name | site-page | social-name]');
                    break;
                }

                const project = PROJECTS.find(p => p.name.toLowerCase().replace(/\s+/g, '-').includes(target) || p.name.toLowerCase().includes(target));
                if (project) {
                    window.open(project.link, '_blank');
                    await typeOutput(`Opening project: ${project.name}...`);
                    break;
                }

                const sitePages: Record<string, string> = {
                    'bookshelf': '/bookshelf',
                    'about': '/about',
                    'projects': '/projects',
                    'tags': '/tags',
                    'archive': '/archive',
                    'blog': '/blog'
                };
                if (sitePages[target]) {
                    window.location.href = sitePages[target];
                    await typeOutput(`Navigating to ${target}...`);
                    break;
                }

                const social = SOCIALS.find(s => s.name.toLowerCase() === target);
                if (social) {
                    window.open(social.href, '_blank');
                    await typeOutput(`Opening ${social.name} profile...`);
                    break;
                }

                await typeOutput(`open: target "${target}" not recognized.`, 'error');
                break;

            case 'whoami':
                await typeOutput([
                    `User: guest`,
                    `Host: shubhamlad.in`,
                    `Bio: ${SITE.desc}`
                ]);
                break;

            case 'socials':
                const lines = SOCIALS.map(s => `${s.name.padEnd(10)} - ${s.href}`);
                await typeOutput(['Connected identities:', ...lines]);
                break;

            case 'date':
                await typeOutput(new Date().toLocaleString());
                break;

            case 'clear':
                setHistory([]);
                break;

            case 'echo':
                let text = args.join(' ');
                if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
                    text = text.slice(1, -1);
                }
                await typeOutput(text);
                break;

            default:
                await typeOutput(`Command not found: ${cmd}. Type "help" for a list of commands.`, 'error');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const parts = input.trim().split(/\s+/);
            const currentToken = parts[parts.length - 1] || '';

            let matches: string[] = [];

            if (parts.length === 1) {
                matches = COMMANDS.filter(c => c.startsWith(currentToken.toLowerCase()));
            } else {
                const node = getCurrentNode(currentPath);
                if (node.children) {
                    matches = node.children
                        .map(c => c.name + (c.type === 'directory' ? '/' : ''))
                        .filter(n => n.startsWith(currentToken.toLowerCase()));
                }
            }

            if (matches.length === 1) {
                setInput([...parts.slice(0, -1), matches[0]].join(' '));
            } else if (matches.length > 1) {
                typeOutput(matches.join('  '), 'info');
            }
        }
    };

    const Prompt = () => (
        <span className="flex items-center mr-2 select-none shrink-0">
            <span style={{ color: COLORS.path }} className="font-bold">~{currentPath.length > 0 ? '/' + currentPath.join('/') : ''}</span>
            <span className="text-white ml-1">$</span>
        </span>
    );

    return (
        <div
            className={`w-full max-w-4xl mx-auto my-8 relative rounded-xl transition-all duration-500 overflow-hidden border border-white/10 bg-[#0d0d0d]/80 backdrop-blur-xl selection:bg-accent/30 cursor-default`}
            style={{
                fontFamily: '"JetBrains Mono", monospace',
                boxShadow: (isFocused || isHovered) && !isCollapsed
                    ? '0 30px 60px -12px color-mix(in srgb, var(--accent), transparent 85%)'
                    : '0 20px 50px -10px rgba(0,0,0,0.2)'
            }}
        >
            {/* Scanline Effect */}
            {!isCollapsed && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] shadow-[inset_0_0_100px_rgba(0,200,0,0.05)]"></div>
            )}

            {/* Terminal Header */}
            <div
                className="flex items-center justify-between bg-white/5 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-3 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors group"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex space-x-2.5">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5)]"></div>
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5)]"></div>
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.5)]"></div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2 opacity-60 text-[10px] sm:text-xs group-hover:opacity-100 transition-opacity">
                    <span style={{ color: COLORS.user }} className="font-bold">shubham</span>
                    <span className="text-white/40">@</span>
                    <span style={{ color: COLORS.host }} className="font-bold">portfolio</span>
                    <span className="text-white/20 ml-1 ml-2">{isCollapsed ? '▼' : '▲'}</span>
                </div>
                <div className="text-white/20 text-[9px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase select-none">
                    zsh
                </div>
            </div>

            {/* Terminal Body */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'h-0 opacity-0 invisible' : 'h-[350px] sm:h-[420px] opacity-100 visible'}`}
                onClick={() => inputRef.current?.focus()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            >
                <div
                    ref={terminalRef}
                    className="p-4 sm:p-6 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent text-white/90 text-xs sm:text-sm md:text-base leading-[1.6] antialiased relative"
                >
                    {/* Command History */}
                    {history.map((line, i) => (
                        <div key={i} className="mb-2">
                            {line.type === 'command' && (
                                <div className="flex items-start">
                                    <span className="flex items-center mr-2 select-none shrink-0">
                                        <span style={{ color: COLORS.path }} className="font-bold">{line.path}</span>
                                        <span className="text-white ml-1">$</span>
                                    </span>
                                    <span className="break-all" style={{ color: COLORS.output }}>{line.text}</span>
                                </div>
                            )}
                            {line.type !== 'command' && (
                                <TerminalLineComponent line={line} />
                            )}
                        </div>
                    ))}

                    {/* Current Prompt */}
                    {!isTyping && (
                        <form
                            onSubmit={(e) => { e.preventDefault(); if (input.trim()) { handleCommand(input); setInput(''); } }}
                            className="flex items-start mt-2"
                        >
                            <Prompt />
                            <div className="relative flex-1 min-w-0">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    spellCheck={false}
                                    autoComplete="off"
                                    className="w-full bg-transparent border-none outline-none text-white/90 caret-transparent absolute inset-0 z-10"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <div
                                    className="pointer-events-none text-white/90 whitespace-pre-wrap break-all min-h-[1.6em]"
                                >
                                    {input}
                                    <span className="inline-block w-2.5 h-[1.2em] bg-white/60 ml-px animate-pulse align-middle -translate-y-[0.1em]" />
                                </div>
                            </div>
                        </form>
                    )}
                    <div ref={bottomRef} className="h-4 w-full" />
                </div>
            </div>
        </div>
    );
};

// --- Terminal Line Component ---
const TerminalLineComponent: React.FC<{ line: TerminalLine }> = ({ line }) => {
    const [displayedText, setDisplayedText] = useState(line.isAnimated ? '' : line.text);

    useEffect(() => {
        if (line.isAnimated && displayedText.length < line.text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(line.text.slice(0, displayedText.length + 1));
            }, 5);
            return () => clearTimeout(timeout);
        }
    }, [displayedText, line.text, line.isAnimated]);

    const color = {
        command: COLORS.command,
        error: COLORS.error,
        info: COLORS.info,
        output: COLORS.output
    }[line.type];

    return (
        <div className="break-words whitespace-pre-wrap" style={{ color }}>
            {displayedText}
        </div>
    );
};

export default EnhancedTerminal;
