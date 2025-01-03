const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

const ExecutorService = require('../services/executor');

const wrapAsync = require('../helpers').wrapAsync;

const router = express.Router();

router.post(
    '/read_project_tree',
    wrapAsync(async (req, res) => {
        const { path } = req.body;
        const tree = await ExecutorService.readProjectTree(path);
        res.status(200).send(tree);
    }),
);

router.post(
    '/read_file_contents',
    wrapAsync(async (req, res) => {
        const { path } = req.body;
        const content = await ExecutorService.readFileContents(path);
        res.status(200).send(content);
    }),
);

router.post(
    '/read_file_header',
    wrapAsync(async (req, res) => {
        const { path, N } = req.body;
        try {
            const header = await ExecutorService.readFileHeader(path, N);
            res.status(200).send(header);
        } catch (error) {
            res.status(500).send({ error: 'Failed to read file header' });
        }
    }),
);

router.post(
    '/read_file_line_context',
    wrapAsync(async (req, res) => {
        const { path, lineNumber, windowSize } = req.body;
        try {
            const context = await ExecutorService.readFileLineContext(path, lineNumber, windowSize);
            res.status(200).send(context);
        } catch (error) {
            res.status(500).send({ error: 'Failed to read file line context' });
        }
    }),
);

router.post(
    '/write_file',
    wrapAsync(async (req, res) => {
        const { path, fileContents, N } = req.body;
        try {
            await ExecutorService.writeFile(path, fileContents, N);
            res.status(200).send({ message: 'File written successfully' });
        } catch (error) {
            res.status(500).send({ error: 'Failed to write file' });
        }
    }),
);

router.post(
    '/update_file_line',
    wrapAsync(async (req, res) => {
        const { path, lineNumber, newText } = req.body;
        try {
            await ExecutorService.updateFileLine(path, lineNumber, newText);
            res.status(200).send({ message: 'File line updated successfully' });
        } catch (error) {
            res.status(500).send({ error: 'Failed to update file line' });
        }
    }),
);

router.post(
    '/update_file_slice',
    wrapAsync(async (req, res) => {
        const { path, startLine, endLine, newCode } = req.body;
        try {
            await ExecutorService.updateFileSlice(path, startLine, endLine, newCode);
            res.status(200).send({ message: 'File slice updated successfully' });
        } catch (error) {
            res.status(500).send({ error: 'Failed to update file slice' });
        }
    }),
);

router.post(
    '/validate_file',
    wrapAsync(async (req, res) => {
        const { path } = req.body;
        try {
            const validationResult = await ExecutorService.validateFile(path);
            res.status(200).send({ validationResult });
        } catch (error) {
            res.status(500).send({ error: 'Failed to validate file' });
        }
    }),
);

router.post(
    '/replace_file_content',
    wrapAsync(async (req, res) => {
        const {path, oldCode, newCode} = req.body;
        try {
            const response = await ExecutorService.replaceFileContent(path, oldCode, newCode);
            res.status(200).send(response);
        } catch (error) {
            res.status(500).send({error: 'Failed to replace file content'})
        }
    })
)

router.post('/update_project_files_from_scheme',
    upload.single('file'), // 'file' - name of the field in the form
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const result = await ExecutorService.updateProjectFilesFromScheme(req.file.path);
            // Remove the temporary file
            fs.unlinkSync(req.file.path);

            res.json(result);
        } catch (error) {
            // Remove the temporary file in case of an error
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Update project files error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);


router.use('/', require('../helpers').commonErrorHandler);

module.exports = router;
