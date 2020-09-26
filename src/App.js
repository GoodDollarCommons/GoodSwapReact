import React, { useEffect, useState } from 'react';
import Web3 from "web3"
import logo from "./logo.svg"

import './App.css';

// ABI imports
import ERC20ABI from './ABIs/ERC20.json'
import GoodReserveABI from './ABIs/GoodReserve.json'

function App() {
  const [web3, setWeb3] = useState(null)
  const [myAddress, setMyAddress] = useState(null)

  useEffect(() => {
    async function getAccount() {
      const getWeb3 = new Web3(window.ethereum)
      window.ethereum.enable()
      window.web3 = getWeb3

      setWeb3(getWeb3)
      const address = (await getWeb3.eth.getAccounts())[0]
      console.log("Wallet address: ", address)
      setMyAddress(address)
    }

    getAccount()
  }, [])

  /**
   * Buy with cDAI at GoodReserve to receive the equivalent G$
   * Note: User must have cDAI already in their wallet!
   */
  async function buy() {
    const cdaiAmountinWei = web3.utils.toWei("1", "Gwei").toString()
    const grAddress = "0x5810950BF9184F286f1C33b2cf80533D2CB274AF" // ropsten address, for other addresses: https://docs.gooddollar.org/smart-contracts-guide/core-contracts-and-api
    const cdaiAddress = "0x6ce27497a64fffb5517aa4aee908b1e7eb63b9ff" // ropsten cDAI
    const minReturn = "0"

    try {
      // Approve the GoodReserveCore address with the cDAI contract
      const cdaiContract = new web3.eth.Contract(ERC20ABI, cdaiAddress)
      await cdaiContract.methods
        .approve(grAddress, cdaiAmountinWei)
        .send({ from: myAddress })
        .catch((e) => {
          throw Error(`Error approving cDAI allowance: ${e.message}`)
        })

      // Make the buy transaction via GoodReserve contract
      const gdContract = new web3.eth.Contract(GoodReserveABI, grAddress)
      await gdContract.methods
        .buy(cdaiAddress, cdaiAmountinWei, minReturn)
        .send({ from: myAddress })
        .catch((e) => {
          throw Error(`Error buying to the GoodReserve contract: ${e.message}`)
        })
    } catch (e) {
      alert(e.message)
      console.log(e.message)
    }
  }

  /**
   * Sell with cDAI at GoodReserve to receive the equivalent G$
   * Note: User must have cDAI already in their wallet!
   */
  async function sell() {
    const gdAmountinWei = web3.utils.toWei("300", "Kwei").toString()
    const gdAddress = "0x4738c5e91c4f809da21dd0df4b5ad5f699878c1c" // ropsten address, for other addresses: https://docs.gooddollar.org/smart-contracts-guide/core-contracts-and-api
    const grAddress = "0x5810950BF9184F286f1C33b2cf80533D2CB274AF" // ropsten address, for other addresses: https://docs.gooddollar.org/smart-contracts-guide/core-contracts-and-api
    const cdaiAddress = "0x6ce27497a64fffb5517aa4aee908b1e7eb63b9ff" // ropsten cDAI
    const minReturn = "0"

    try {
      // Approve the GoodReserveCore address with the cDAI contract
      const gdContract = new web3.eth.Contract(ERC20ABI, gdAddress)
      await gdContract.methods
        .approve(grAddress, gdAmountinWei)
        .send({ from: myAddress })
        .catch((e) => {
          throw Error(`Error approving GD allowance: ${e.message}`)
        })

      // Make the buy transaction via GoodReserve contract
      const grContract = new web3.eth.Contract(GoodReserveABI, grAddress)
      await grContract.methods
        .sell(cdaiAddress, gdAmountinWei, minReturn)
        .send({ from: myAddress })
        .catch((e) => {
          throw Error(`Error selling to the GoodReserve contract: ${e.message}`)
        })
    } catch (e) {
      alert(e.message)
      console.log(e.message)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          See our{" "}
          <a className="App-link" href="https://docs.gooddollar.org/smart-contracts-guide" >
            official smart contracts guide
          </a>{" "}
          for more
        </p><p>
          Web3 connected successfully with address:
          <br />
          {myAddress}
        </p>
        <p>
        <button className="App-button" onClick={async () => await buy()}>
          Buy
        </button>
        <button className="App-button" onClick={async () => await sell()}>
          Sell
        </button>
        </p>
      </header>
    </div>
  )
}

export default App;
