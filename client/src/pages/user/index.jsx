import React, { useState, useEffect } from 'react'
import {Box, Typography, Backdrop, CircularProgress, TextField, FormControl} from '@mui/material'
import useEth from '../../contexts/EthContext/useEth'
import Record from '../../components/Record'
import CustomButton from '../../components/CustomButton'
import { useNavigate } from 'react-router-dom'
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";

const User = () => {
  const {
    state: { contract, accounts, role, loading },
  } = useEth()

  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(true)

  useEffect(() => {
    const getRecords = async () => {
      try {
        const records = await contract.methods.getRecords(accounts[0]).call({ from: accounts[0] })
        setRecords(records)
        setLoadingRecords(false)
      } catch (err) {
        console.error(err)
        setLoadingRecords(false)
      }
    }
    getRecords()
  })



  if (loading || loadingRecords) {
    return (
        <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color='inherit' />
        </Backdrop>
    )
  } else {
    return (
        <Box display='flex' justifyContent='center' width='100vw'>
          <Box width='60%' my={5}>
            <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={loading}>
              <CircularProgress color='inherit' />
            </Backdrop>
            {!accounts ? (
                <Box display='flex' justifyContent='center'>
                  <Typography variant='h6'>Open your MetaMask wallet to get connected, then refresh this page</Typography>
                </Box>
            ) : (
                <>
                  {role === 'unknown' && (
                      <Box display='flex' justifyContent='center'>
                        <Typography variant='h5'>You're not registered, please go to home page</Typography>
                      </Box>
                  )}
                  {role === 'admin' && (
                      <Box display='flex' justifyContent='center'>
                        <Typography variant='h5'>Only user can access this page</Typography>
                      </Box>
                  )}
                  {role === 'user' && (
                      <>
                        <Box display='flex' alignItems='left' justifyContent='left' my={5}>
                          <Typography variant='h3'>Transaction Info</Typography>
                        </Box>

                        <Box display='flex' alignItems='left' justifyContent='left' my={5}>
                          <Typography variant='h4'>Latest transaction</Typography>
                        </Box>
                        <Box display='flex' alignItems='left' justifyContent='left' my={5}>
                          <Typography variant='h5'>Transaction Hash: 0xc7d30c40475bb3d16bb9cac24a59fd02faf03d308d324b19061e8abed6c11241 </Typography>
                        </Box>
                        <Box display='flex' alignItems='left' justifyContent='left' my={5}>
                          <Typography variant='h5'>Status:          Success</Typography>
                        </Box>
                        <Box display='flex' alignItems='left' justifyContent='left' my={5}>
                          <Typography variant='h5'>Block:           6888970</Typography>
                        </Box>
                        <Box display='flex' alignItems='left' justifyContent='left' my={5}>
                          <Typography variant='h5'>Time stamp:      179 days 20 hrs ago (May-15-2022 01:02:04 PM +UTC)</Typography>
                        </Box>


                        <FormControl fullWidth>

                          <CustomButton text = "Go to transaction page" link ="https://krypty-daongocquockhanh.vercel.app/transaction" >
                            <LoginRoundedIcon style={{ color: 'white' }} />
                          </CustomButton>

                        </FormControl>
                        <Box display='flex' alignItems='left' justifyContent='left' my={5}>
                          <Typography variant='h4'>Bills</Typography>
                        </Box>
                        {records.length === 0 && (
                            <Box display='flex' alignItems='right' justifyContent='right' my={5}>
                              <Typography variant='h5'>No bills found</Typography>
                            </Box>
                        )}

                        {records.length > 0 && (
                            <Box display='flex' flexDirection='column' mt={3} mb={-2}>
                              {records.map((record, index) => (
                                  <Box mb={2}>
                                    <Record key={index} record={record} />
                                  </Box>
                              ))}
                            </Box>
                        )}
                      </>
                  )}
                </>
            )}
          </Box>
        </Box>
    )
  }
}

export default User
