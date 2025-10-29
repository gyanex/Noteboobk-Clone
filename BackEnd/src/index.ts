import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from "dotenv";
import { PDFReader } from "@llamaindex/readers/pdf";
import { GeminiEmbedding, GEMINI_MODEL, gemini } from "@llamaindex/google";
import {readdir, lstat, unlink} from 'fs/promises'
import { Settings, StorageContext, VectorStoreIndex , storageContextFromDefaults} from 'llamaindex';
import path from 'path';
dotenv.config();


const storage = multer.diskStorage({
  destination: function(req, file,cb){
    cb(null, 'public/')
  },
  filename:function(req, file, cb){
    cb(null, Date.now()+'.pdf')
  }
})

var storageContext : StorageContext

const llm = gemini({
  apiKey: process.env.GOOGLE_API_KEY,
  model: GEMINI_MODEL.GEMINI_2_5_PRO_LATEST// or "gemini-1.5-pro"
});
Settings.llm =llm
Settings.embedModel = new GeminiEmbedding({
  apiKey:process.env.GOOGLE_API_KEY
});

const upload = multer({storage:storage})

const app = express();

//app.use(cors({origin:"https://famous-syrniki-380ae1.netlify.ap"}));
app.use(cors({
  origin: '*', // or specify your allowed origin
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.static('public'))
app.use(express.json())


app.post('/upload',upload.single('pdf'), async (req,res,next) =>{
  const pdfFile = await readdir('public')
  for (const file of pdfFile) {
      const filePath = path.join("public", file);
      const stat = await lstat(filePath);
      if (stat.isFile() && file !== req.file?.filename) {
        await unlink(filePath);
      }
    }

  const storgeFile = await readdir('storage')
  for (const file of storgeFile) {
      const filePath = path.join("storage", file);
      const stat = await lstat(filePath);
      if (stat.isFile()) {
        await unlink(filePath);
      }
    }
  console.log(req.file?.filename)
  createVectorIndex(req.file?.filename!)
  res.send({path:`${req.file?.filename}`})
})

app.get('/query/:query', async(req,res)=>{
  console.log(req.params.query)
  const result = await doQuery(req.params.query)
  res.send({result:result})
})

app.listen(8000, async () => {
  console.log('server started')
})

async function createVectorIndex(fileName:string) {
   storageContext = await storageContextFromDefaults({
      persistDir: "storage",
    });
    const documents = await new PDFReader().loadData(
      `public/${fileName}`
    );
    const index = await VectorStoreIndex.fromDocuments(documents, { storageContext });
}

async function doQuery(query:string){
  const index = await VectorStoreIndex.init({ storageContext });
  const queryEngine = index.asQueryEngine();
  const results = await queryEngine.query({
  query,
});
  return results;
}

export default app;
