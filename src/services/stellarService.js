const { Horizon } = require('@stellar/stellar-sdk');

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

const verifyPayment = async (walletAddress, invoiceCode) => {
    try {
        console.log(`['STELLAR] Mengecek transaksi di dompet: ${walletAddress} dengan Memo: ${invoiceCode} `);

        const response = await server.transactions()
            .forAccount(walletAddress)
            .order('desc')
            .limit(15)
            .call();

        const foundTx = response.records.find(tx => {
            return tx.memo === invoiceCode;
        });

        if(foundTx){
            console.log(`[STELLAR] ✅ Transaksi ditemukan! Hash: ${foundTx.hash}`);
            return { paid: true, txHash: foundTx.hash };
        }

        console.log(`[STELLAR] ⏳ Belum ada transaksi masuk untuk invoice ini.`);
        return { paid: false};

    } catch (error) {
        console.error("[STELLAR] Gagal cek jaringan:", error.message);
        return { paid: false, error: error.message }
    }
};

module.exports = {
    verifyPayment
};