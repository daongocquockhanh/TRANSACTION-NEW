import { Box, Divider, FormControl, Modal, TextField, Typography, Backdrop, CircularProgress } from '@mui/material'
import React, { useCallback } from 'react'
import { useState } from 'react'
import CustomButton from '../../components/CustomButton'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import useEth from '../../contexts/EthContext/useEth'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import useAlert from '../../contexts/AlertContext/useAlert'
import UpdateBillModal from './UpdateBillModal'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import ipfs from '../../ipfs'
import Record from '../../components/Record'
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import FmdGoodIcon from '@mui/icons-material/FmdGood';

const Admin = () => {
  const {
    state: { contract, accounts, role, loading },
  } = useEth()
  const { setAlert } = useAlert()

  const [userExist, setUserExist] = useState(false)
  const [searchUserAddress, setSearchUserAddress] = useState('')
  const [addUserAddress, setAddUserAddress] = useState('')
  const [addUserName, setAddUserName] = useState('')
  const [records, setRecords] = useState([])
  const [addRecord, setAddRecord] = useState(false)

  const searchUser = async () => {
    try {
      if (!/^(0x)?[0-9a-f]{40}$/i.test(searchUserAddress)) {
        setAlert('Invalid address', 'error')
        return
      }
      const userExists = await contract.methods.getUserExists(searchUserAddress).call({ from: accounts[0] })
      if (userExists) {
        const records = await contract.methods.getRecords(searchUserAddress).call({ from: accounts[0] })
        console.log('records :>> ', records)
        setRecords(records)
        setUserExist(true)
      } else {
        setAlert('User not found', 'error')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const registerUser = async () => {
    try {
      await contract.methods.addUser(addUserAddress).send({ from: accounts[0] })
    } catch (err) {
      console.error(err)
    }
  }
  const addRecordCallback = useCallback(
    async (buffer, fileName, userAddress) => {
      if (!userAddress) {
        setAlert('No user entered', 'error')
        return
      }
      try {
        const res = await ipfs.add(buffer)
        const ipfsHash = res[0].hash
        if (ipfsHash) {
          await contract.methods.addRecord(ipfsHash, fileName, userAddress).send({ from: accounts[0] })
          setAlert('New bill uploaded', 'success')
          setAddRecord(false)

          // refresh records
          const records = await contract.methods.getRecords(userAddress).call({ from: accounts[0] })
          setRecords(records)
        }
      } catch (err) {
        setAlert('Record upload failed', 'error')
        console.error(err)
      }
    },
    [addUserAddress, accounts, contract]
  )

  if (loading) {
    return (
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color='inherit' />
      </Backdrop>
    )
  } else {
    return (
      <Box display='flex' justifyContent='center' width='100vw'>
        <Box width='60%' my={5}>
          {!accounts ? (
            <Box display='flex' justifyContent='center'>
              <Typography variant='h6'>Connect to your wallet and refresh the page</Typography>
            </Box>
          ) : (
            <>
              {role === 'unknown' && (
                <Box display='flex' justifyContent='center'>
                  <Typography variant='h5'>You're not registered, please go to home page</Typography>
                </Box>
              )}
              {role === 'user' && (
                <Box display='flex' justifyContent='center'>
                  <Typography variant='h5'>Only admin can access this page</Typography>
                </Box>
              )}
              {role === 'admin' && (
                <>
                  <Modal open={addRecord} onClose={() => setAddRecord(false)}>
                    <UpdateBillModal
                      handleClose={() => setAddRecord(false)}
                      handleUpload={addRecordCallback}
                      userAddress={searchUserAddress}
                    />
                  </Modal>

                  <Typography variant='h4'>Bill of user</Typography>
                  <Box display='flex' alignItems='center' my={1}>
                    <FormControl fullWidth>
                      <TextField
                        variant='outlined'
                        placeholder='Enter user public key'
                        value={searchUserAddress}
                        onChange={e => setSearchUserAddress(e.target.value)}
                        InputProps={{ style: { fontSize: '15px' } }}
                        InputLabelProps={{ style: { fontSize: '15px' } }}
                        size='small'
                      />
                    </FormControl>
                    <Box mx={2}>
                      <CustomButton text={'Search'} handleClick={() => searchUser()}>
                        <SearchRoundedIcon style={{ color: 'white' }} />
                      </CustomButton>
                    </Box>
                    <CustomButton text={'New Bill'} handleClick={() => setAddRecord(true)} disabled={!userExist}>
                      <CloudUploadRoundedIcon style={{ color: 'white' }} />
                    </CustomButton>
                  </Box>

                  {userExist && records.length === 0 && (
                    <Box display='flex' alignItems='center' justifyContent='center' my={5}>
                      <Typography variant='h5'>No records found</Typography>
                    </Box>
                  )}

                  {userExist && records.length > 0 && (
                    <Box display='flex' flexDirection='column' mt={3} mb={-2}>
                      {records.map((record, index) => (
                        <Box mb={2}>
                          <Record key={index} record={record} />
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Box mt={6} mb={4}>
                    <Divider />
                  </Box>

                  <Typography variant='h4'>Add user</Typography>
                  <Box display='flex' alignItems='center' my={1}>
                    <FormControl fullWidth>
                      <TextField
                        variant='outlined'
                        placeholder='Enter user public key'
                        value={addUserAddress}
                        onChange={e => setAddUserAddress(e.target.value)}
                        InputProps={{ style: { fontSize: '15px' } }}
                        InputLabelProps={{ style: { fontSize: '15px' } }}
                        size='small'
                      />
                    </FormControl>
                    
                    <Box mx={3}>
                      <CustomButton text={'Register'} handleClick={() => registerUser()}>
                        <PersonAddAlt1RoundedIcon style={{ color: 'white' }} />
                      </CustomButton>
                    </Box>
                  </Box>
                </>
              )}
            </>
          )}
          <Box mt={6} mb={4}>
            <Divider />
          </Box>

          <Typography variant='h4'>Go to Social page</Typography>
          <Typography variant='h6'>This page will stage all users comment about the service</Typography>
            <FormControl fullWidth>

                <CustomButton text = "Go to Social page" link ="https://krypty-daongocquockhanh.vercel.app" >
                    <FmdGoodIcon style={{ color: 'white' }} />
                </CustomButton>

            </FormControl>
        </Box>
      </Box>
    )
  }
}

export default Admin
