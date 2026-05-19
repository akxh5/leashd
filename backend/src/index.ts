import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import walletRoutes from './routes/wallets'
import transactionRoutes from './routes/transactions'
import webhookRoutes from './routes/webhooks'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'leashd-backend' })
})

app.use('/api/auth', authRoutes)
app.use('/api/wallets', walletRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/webhooks', webhookRoutes)

app.listen(PORT, () => {
  console.log(`Leashd backend running on port ${PORT}`)
})

export default app
