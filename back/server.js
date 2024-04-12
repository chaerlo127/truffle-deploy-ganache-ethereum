const express = require('express');
const app = express();
const cors = require('cors');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const CounterContract = require('./contract/Counter.json');
/**
 * 프론트앤드에서 트랜잭션을 실행하고 싶은 경우 바로 메타마스크로 전달하지 않고, 
 * 프론트앤드에서 원하는 계정를 BODY에 넣어 백앤드로 호출하면 백앤드에서 트랜잭션 객체를 생성한 이후 객체를 전달해주고 
 * 그 객체로 메타마스크에 전달하여 트랜잭션 실행
 */
app.use(
    cors({
        origin: true,
        credentials: true,
    }),
);
app.use(express.json());

app.post('/api/increment', async (req, res) => {
    const { from } = req.body;

    const nonce = await web3.eth.getTransactionCount(from);
    const networkId = await web3.eth.net.getId();
    const CA = CounterContract.networks[networkId].address;
    const abi = CounterContract.abi;

    // abi 파일
    // increment().encodeABI() : 원본데이터로 변환 (바이트 코드로 변환)
    const deployed = new web3.eth.Contract(abi, CA);
    const data = await deployed.methods.increment().encodeABI();

    let txObject = {
        nonce,
        from,
        to: CA,
        data,
    };

    res.json(txObject);

    /**
     * data 부분에 들어가는 값
     * Smart Contract 함수에 대한 내용
     * 스마트 컨트랙트 함수를 실행시킬 수 있는 어떠한 값
     * 함수를 실행시킬 수 있는 메세지 작성
     */
});

app.listen(4000, () => {
    console.log('back server onload');
});
