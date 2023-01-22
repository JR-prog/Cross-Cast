"use client"

import { GenericPost, Origin } from '../types/all'
import MessageCardContainer from '../components/MessageCardContainer'
import DateContainer from '@/components/DateContainer';
import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, FormControl, FormLabel, Grid, GridItem, IconButton, Menu, MenuButton, Select, Switch, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai'
import React from 'react';
import { TweetFilter } from '@/pages/api/twitter';

export default function MainContainer({ posts } : { posts: GenericPost[] }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef()

  const [clientPosts, setClientPosts] = useState<GenericPost[]>(posts)

  // Filters and sorts
  const [filterType, setFilterType] = useState<TweetFilter>(TweetFilter.latest)
  const [integration, setIntegration] = useState<Origin | ''>('')

  const handleSubmit = async () => {
    const newPosts = await (await fetch(`/api/integrations?days=7&filterType=${filterType}&integration=${integration}`)).json() as GenericPost[]
    console.log(newPosts);
    
    setClientPosts(newPosts)
    onClose()
  }

  useEffect(() => {
    console.log(filterType, integration);
  }, [filterType, integration])
  

  function getTimestamp(date: Date) {
    return date.setHours(0, 0, 0, 0)
  }

  function assertDate(post: GenericPost) {
    if (typeof post.date === 'string') {
      return new Date(post.date);
    }
    return post.date
  }
  
  const dataDateAdjusted: GenericPost[] = clientPosts?.map(post => (
    {
      ...post,
      date: new Date(post.date)
    }
  ))

  function getDateSet(posts: GenericPost[]) {
    return posts.map(p => new Date(getTimestamp(assertDate(p)))).filter((date, i, self) => 
    self.findIndex(d => new Date(d).getTime() === new Date(date).getTime()) === i)
  }

  return (
    <Grid>
      <Flex justifyContent='center' alignItems='center'>
        <h1 style={{ textAlign: 'center', marginBlock: '1em' }}>CrossCast Timeline</h1>
        <IconButton aria-label='Menu' ref={btnRef} colorScheme='teal' onClick={onOpen} icon={<AiOutlineMenu />} />
        <Drawer
          isOpen={isOpen}
          placement='right'
          onClose={onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Timeline Configuration</DrawerHeader>

            <DrawerBody>
              <FormControl>
                <h3 style={{ marginBottom: '0.5em' }}>Filter by:</h3>
                <Flex direction='row' gap='10px' alignContent='center'>
                  <FormLabel style={{ marginRight: '0' }} htmlFor='filterType'>Latest</FormLabel>
                  <Switch id='filterType' isChecked={filterType === TweetFilter.mostLiked} onChange={e => setFilterType(e.target.checked ? TweetFilter.mostLiked : TweetFilter.latest)} />
                  <FormLabel style={{ marginRight: '0' }} htmlFor='filterType'>Most Liked</FormLabel>
                </Flex>
                <Select value={integration} onChange={e => setIntegration(e.target.value)}>
                  <option value=''>All</option>
                  <option value='GITHUB'>GitHub</option>
                  <option value='SLACK'>Slack</option>
                  <option value='TWITTER'>Twitter</option>
                </Select>
                <Button onClick={() => handleSubmit()}>Save</Button>
              </FormControl>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
      {
        getDateSet(dataDateAdjusted).map((date, index) => (
          <GridItem key={index}>
            <DateContainer date={date}>
              {
                clientPosts
                  .filter(post => {
                    return getTimestamp(assertDate(post)) === getTimestamp(date)
                  })
                  .map((post, index) => <MessageCardContainer key={index} post={post}/>)
              }
            </DateContainer>
          </GridItem>
        ))
        
      }
    </Grid>
  )
}
