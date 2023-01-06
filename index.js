//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

//modulos internos

const fs = require('fs')
const { parse } = require('path')

const prompt = inquirer.createPromptModule()

operation()

function operation() {


    prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Transferir',
            'Sair'
        ]
    }
    ]).then((answer) => {
        const action = answer['action']

        switch (action) {
            case 'Criar conta': createAccount(); break;
            case 'Consultar Saldo': getAccountBalance(); break;
            case 'Depositar': deposit(); break;
            case 'Sacar': withdraw(); break;
            case 'Transferir' : transfer(); break;
            case 'Sair': exit(); break;

        }


    }).catch(err => console.log(err))
}


//Create Account
function createAccount() {
    console.log(chalk.bgGreen.black('Obrigado Por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir: '))
    buildAccount()
}

function buildAccount() {


    prompt([{
        name: 'accountName',
        message: 'Digite um nome para sua conta: '
    }]).then((answer) => {
        const accountName = answer['accountName']

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if (!accountName) {
            console.log(chalk.bgRed.black('Por favor, adicione um nome a conta!'))
            buildAccount()
            return
        }
        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Essa conta já existe. Escolha outro nome.'))
            buildAccount()
            return
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function (err) {
            console.log(err)
        })

        console.log(chalk.green('Parabens, sua conta foi criada!'))
        operation()

    }).catch(err => console.log(err))
}

//Encerrar programa

function exit() {
    console.log(chalk.bgGreen.black('Obrigado Por Usar Accounts'))
    process.exit()
}

//add an amount to user account
function deposit() {



    prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }
    ]).then((answer) => {
        const accountName = answer['accountName']

        if (!checkAccount(accountName)) {
            deposit()
            return
        }

        prompt([{
            name: 'amount',
            message: 'Quanto voce deseja depositar?'
        }]).then((answer2) => {
            const amount = answer2['amount']

            //add amount
            addAmount(accountName, amount)
        }

        ).catch(err => { console.log(err) })
    }

    ).catch(err => { console.log(err) })
}



function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('A conta não existe. Tente novamente'))
        return false
    }
    return true

}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        deposit()
        return
    }

    accountData.balance += parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`, JSON.stringify(accountData), function (err) {
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount} em sua conta`))
    operation()
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8', flag: 'r'
    })

    return JSON.parse(accountJSON)
}


//Show account balance
function getAccountBalance() {


    prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {

        const accountName = answer['accountName']

        //
        if (!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é de R$${accountData.balance}`))
        operation()

    }).catch(err => console.log(err))
}


function withdraw() {


    prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {

        const accountName = answer['accountName']

        if (!checkAccount(accountName)) {
            return withdraw()
        }

        prompt([
            {
                name: 'amount',
                message: 'Quanto voce deseja sacar?'
            }
        ]).then((answer) => {

            const amount = answer['amount']

            removeAmount(accountName, amount)

        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}


function removeAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'))
        return withdraw()
    }

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor Indisponivel!!'))
        return withdraw()
    }

    accountData.balance -= parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`, JSON.stringify(accountData), function (err) {
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi realizado o saque de R$${amount} na sua conta!`))
    operation()
}

//Desafios
//Transferencia entre contas
//Olhar outras operações de bancos

function transfer(){

    prompt([{
        name : 'accountName',
        message : 'Qual sua conta?'
    }]).then((answer) => {
        const accountName = answer['accountName']
        
        if(!checkAccount(accountName)){
            transfer()
            return
        }

        prompt([{
            name : 'amount',
            message : 'Quanto você deseja transferir?'
        }]).then((answer) => {
            const amount = answer['amount']

            transferAction(accountName,amount)

        }).catch(err => {console.log(err)})


    }).catch(err => {console.log(err)})

}

function transferAction(accountToTransfer, amount){
    const accountData = getAccount(accountToTransfer)

    if(accountData.balance < amount){
        console.log(chalk.bgRed.black('O valor é invalido, tente novamente!!'))
        transfer()
        return
    }

    prompt([{
        name : 'accountToReceive',
        message : 'Para qual conta deseja transferir?'
    }]).then((answer) => {
        const accountToReceive = answer['accountToReceive']

        if(!checkAccount(accountToReceive)){
            transferAction(accountToTransfer,amount)
            return
        }

        if(accountToTransfer == accountToReceive){
            console.log(chalk.bgRed.black('Voce não pode transferir para a mesma conta!!'))
            transferAction(accountToTransfer,amount)
            return
        }

        const accountDataToReceive = getAccount(accountToReceive)
        
        accountData.balance -= parseFloat(amount)
        fs.writeFileSync(`accounts/${accountToTransfer}.json`, JSON.stringify(accountData), function(err) {console.log(err)})

        accountDataToReceive.balance += parseFloat(amount)
        fs.writeFileSync(`accounts/${accountToReceive}.json`, JSON.stringify(accountDataToReceive), function(err) {console.log(err)})

        console.log(chalk.green(`Transferencia de ${accountToTransfer} para ${accountToReceive} feita com sucesso!`))
        operation()
        
    }).catch(err => {console.log(err)})
}