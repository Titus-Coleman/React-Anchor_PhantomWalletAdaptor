import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import * as BufferLayout from "@solana/buffer-layout";
import { Buffer } from 'buffer';
import React, { FC, ReactNode, useMemo } from 'react';
import idl from './idl.json';

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            /**
             * Select the wallets you wish to support, by instantiating wallet adapters here.
             *
             * Common adapters can be found in the npm package `@solana/wallet-adapter-wallets`.
             * That package supports tree shaking and lazy loading -- only the wallets you import
             * will be compiled into your application, and only the dependencies of wallets that
             * your users connect to will be loaded.
             */
            
            new PhantomWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

const Content: FC = () => {
    const wallet = useAnchorWallet();
    const baseAccount = web3.Keypair.generate();

    function getProvider() {    
        if (!wallet) {
            return null;
        }
        /* create the provider and return it to the caller */
        /* network set to local network for now */
        const network = "http://127.0.0.1:8899";
        const connection = new Connection(network, "processed");

        const provider = new AnchorProvider(
            connection, wallet, {"preflightCommitment": "processed"},
        );
        return provider;
      }   

    async function createCounter() {
        const provider = getProvider()
        if (!provider) {
            throw("Provider is null");
        }
        /*create the program interface combining the idl, program ID, and provider */
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);
        try {
            /* interact with the program via RPC */
            await program.rpc.initialize({
                accounts: {
                    myAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [baseAccount]
            });

            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log('account:', account);
        } catch (err) { 
            console.log("Transaction error: ", err);
        }
    }

    async function increment() {
        const provider = getProvider()
        if (!provider) {
            throw("Provider is null");
        }
        /*create the program interface combining the idl, program ID, and provider */
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);
        try {
            /* interact with the program via RPC */
            await program.rpc.increment({
                accounts: {
                    myAccount: baseAccount.publicKey,
                },
            });

            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log('account:', account.data.toString());
        } catch (err) { 
            console.log("Transaction error: ", err);
        }
    }

    async function decrement() {
        const provider = getProvider()
        if (!provider) {
            throw("Provider is null");
        }
        /*create the program interface combining the idl, program ID, and provider */
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);
        try {
            /* interact with the program via RPC */
            await program.rpc.decrement({
                accounts: {
                    myAccount: baseAccount.publicKey,
                },
            });

            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log('account:', account.data.toString());
        } catch (err) { 
            console.log("Transaction error: ", err);
        }
    }

    /*Does not work due to Buffer is not defined error*/
    async function update() {
        const provider = getProvider()
        if (!provider) {
            throw("Provider is null");
        }
        /*create the program interface combining the idl, program ID, and provider */
        const a = JSON.stringify(idl);
        const b = JSON.parse(a);
        const program = new Program(b, idl.metadata.address, provider);
        try {
            /* interact with the program via RPC */
            await program.rpc.update(new BN(100,3),{
                accounts: {
                    myAccount: baseAccount.publicKey,
                },
            });

            const account = await program.account.myAccount.fetch(baseAccount.publicKey);
            console.log('account:', account.data.toString());
        } catch (err) { 
            console.log("Transaction error: ", err);
        }
    }

    return (
            <div className="App">
                <button onClick={createCounter}>Initialize</button>
                <button onClick={decrement}>Decrement</button>
                <button onClick={update}>Update</button>
                <button onClick={increment}>Increment</button>
                <WalletMultiButton />
            </div>
        );
};
