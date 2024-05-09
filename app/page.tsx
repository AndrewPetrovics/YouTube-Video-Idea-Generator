
"use client"

import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Card, CardHeader, Container, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";

export default function Page() {

  const [channelUrl, setChannelUrl] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const onGenerateSuggestions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api', {
        method: 'POST',
        body: JSON.stringify({
          channelUrl,
        })
      })

      const json = await response.json()
      setSuggestions(json.suggestions)
    }
    catch (e) {
      // Something went wrong - show an error
      console.error(e)
    }
    finally {
      setIsLoading(false)
    }

  }

  const onChannelUrlChange = (e: any) => {
    setChannelUrl(e.target.value)
  }


  return (
    <>

      <Container maxWidth='md' className='blog' sx={{ pb: 8 }}>

        <Box textAlign={'center'}>
          <Typography variant="h1">YouTube Video Ideas Generator</Typography>
          <Typography variant="h6">Get ideas for your next video based on your previous videos</Typography>
        </Box>

        <Stack spacing={2} sx={{ mt: 5 }}>
          <TextField
            sx={{ mt: 1, mb: 2 }}
            value={channelUrl}
            label='YouTube Channel URL'
            placeholder={'https://www.youtube.com/@channel'}
            fullWidth
            variant="outlined"
            onChange={onChannelUrlChange}
          />

          <Box textAlign={'center'}>
            <Box display='flex' justifyContent={'center'} mt={3}>
              <LoadingButton
                sx={{ minHeight: '48px', fontSize: '18px', borderRadius: '80px', pl: 4, pr: 4 }}
                onClick={onGenerateSuggestions}
                variant='contained'
                loading={isLoading} >
                Generate Suggestions
              </LoadingButton>
            </Box>
          </Box>

        </Stack>

        {!!suggestions.length && <Stack sx={{ pt: 5 }}>

          <Typography variant="h5" textAlign={'center'}>Here are your suggestions... </Typography>

          <Stack spacing={3}>
            {suggestions.map(suggestion => {
              return (
                <Card variant="outlined" key={suggestion.title}>


                  <CardHeader
                    title={suggestion.title}
                    subheader={suggestion.description}
                  />





                </Card>

              )
            })}
          </Stack>


        </Stack>
        }
      </Container>

    </>
  )
}

