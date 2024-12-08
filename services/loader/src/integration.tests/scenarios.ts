export const scenarios = [
    {
        "description": "Load files recursively with includeContent and matchPattern",
        "setup": {
            "files": [
                {
                    "path": "file1.txt",
                    "content": "File 1 content"
                },
                {
                    "path": "subdir/file2.md",
                    "content": "File 2 content"
                },
                {
                    "path": "subdir/file3.txt",
                    "content": "File 3 content"
                }
            ],
            "folders": [
                "subdir"
            ]
        },
        "input": {
            "sources": [
                {
                    "mode": "path",
                    "basePath": "{tempDir}",
                    "recursive": true,
                    "includeContent": true,
                    "matchPattern": ".txt"
                }
            ]
        },
        "expected": [
            {
                "path": "{tempDir}/file1.txt",
                "type": ".txt",
                "content": "File 1 content"
            },
            {
                "path": "{tempDir}/subdir/file3.txt",
                "type": ".txt",
                "content": "File 3 content"
            }
        ]
    },
    {
        "description": "Load files non-recursively without includeContent",
        "setup": {
            "files": [
                {
                    "path": "file1.txt",
                    "content": "File 1 content"
                },
                {
                    "path": "subdir/file2.md",
                    "content": "File 2 content"
                }
            ],
            "folders": [
                "subdir"
            ]
        },
        "input": {
            "sources": [
                {
                    "mode": "path",
                    "basePath": "{tempDir}",
                    "recursive": false,
                    "includeContent": false
                }
            ]
        },
        "expected": [
            {
                "path": "{tempDir}/file1.txt",
                "type": ".txt"
            }
        ]
    },
    {
        "description": "Load files using list mode",
        "setup": {
            "files": [
                {
                    "path": "file1.txt",
                    "content": "File 1 content"
                },
                {
                    "path": "file2.md",
                    "content": "File 2 content"
                }
            ]
        },
        "input": {
            "sources": [
                {
                    "mode": "list",
                    "files": [
                        "{tempDir}/file1.txt",
                        "{tempDir}/file2.md"
                    ],
                    "includeContent": true
                }
            ]
        },
        "expected": [
            {
                "path": "{tempDir}/file1.txt",
                "type": ".txt",
                "content": "File 1 content"
            },
            {
                "path": "{tempDir}/file2.md",
                "type": ".md",
                "content": "File 2 content"
            }
        ]
    },
    {
        "description": "Handle invalid basePath",
        "input": {
            "sources": [
                {
                    "mode": "path",
                    "basePath": "invalid/path",
                    "recursive": false,
                    "includeContent": true
                }
            ]
        },
        "error": "Error: ENOENT: no such file or directory, scandir 'invalid/path'"
    },
    {
        "description": "Handle invalid files list",
        "input": {
            "sources": [
                {
                    "mode": "list",
                    "files": [
                        "invalid/path1",
                        "invalid/path2"
                    ],
                    "includeContent": true
                }
            ]
        },
        "error": "Error: ENOENT: no such file or directory, open 'invalid/path1'"
    },
    {
        "description": "Load files with excludePattern",
        "setup": {
            "files": [
                {
                    "path": "file1.txt",
                    "content": "File 1 content"
                },
                {
                    "path": "subdir/file2.md",
                    "content": "File 2 content"
                },
                {
                    "path": "subdir/file3.txt",
                    "content": "File 3 content"
                }
            ],
            "folders": [
                "subdir"
            ]
        },
        "input": {
            "sources": [
                {
                    "mode": "path",
                    "basePath": "{tempDir}",
                    "recursive": true,
                    "includeContent": true,
                    "excludePattern": ".md"
                }
            ]
        },
        "expected": [
            {
                "path": "{tempDir}/file1.txt",
                "type": ".txt",
                "content": "File 1 content"
            },
            {
                "path": "{tempDir}/subdir/file3.txt",
                "type": ".txt",
                "content": "File 3 content"
            }
        ]
    }
]