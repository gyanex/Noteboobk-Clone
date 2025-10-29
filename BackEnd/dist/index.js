"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const pdf_1 = require("@llamaindex/readers/pdf");
const google_1 = require("@llamaindex/google");
const promises_1 = require("fs/promises");
const llamaindex_1 = require("llamaindex");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// multer file upload
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.pdf');
    }
});
var storageContext;
//
const llm = (0, google_1.gemini)({
    apiKey: process.env.GOOGLE_API_KEY,
    model: google_1.GEMINI_MODEL.GEMINI_2_5_PRO_LATEST // or "gemini-1.5-pro"
});
llamaindex_1.Settings.llm = llm;
llamaindex_1.Settings.embedModel = new google_1.GeminiEmbedding({
    apiKey: process.env.GOOGLE_API_KEY
});
const upload = (0, multer_1.default)({ storage: storage });
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "http://localhost:4200" }));
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
//upload file
app.post('/upload', upload.single('pdf'), async (req, res, next) => {
    const pdfFile = await (0, promises_1.readdir)('public'); //delete pdf files
    for (const file of pdfFile) {
        const filePath = path_1.default.join("public", file);
        const stat = await (0, promises_1.lstat)(filePath);
        if (stat.isFile() && file !== req.file?.filename) {
            await (0, promises_1.unlink)(filePath);
        }
    }
    const storgeFile = await (0, promises_1.readdir)('storage'); // delete vectors
    for (const file of storgeFile) {
        const filePath = path_1.default.join("storage", file);
        const stat = await (0, promises_1.lstat)(filePath);
        if (stat.isFile()) {
            await (0, promises_1.unlink)(filePath);
        }
    }
    createVectorIndex(req.file?.filename);
    res.send({ path: `${req.file?.filename}` });
});
// querying document endpoint
app.get('/query/:query', async (req, res) => {
    console.log(req.params.query);
    const result = await doQuery(req.params.query);
    res.send({ result: result });
});
app.listen(8000, async () => {
    console.log('server started');
});
//creating index using pdf file
async function createVectorIndex(fileName) {
    storageContext = await (0, llamaindex_1.storageContextFromDefaults)({
        persistDir: "storage",
    });
    const documents = await new pdf_1.PDFReader().loadData(`public/${fileName}`);
    const index = await llamaindex_1.VectorStoreIndex.fromDocuments(documents, { storageContext });
}
//querying function
async function doQuery(query) {
    const index = await llamaindex_1.VectorStoreIndex.init({ storageContext });
    const queryEngine = index.asQueryEngine();
    const results = await queryEngine.query({
        query,
    });
    return results;
}
exports.default = app;
