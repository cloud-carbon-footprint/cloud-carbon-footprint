import React from "react";
import axios from 'axios'
import useRemoteService from './RemoteServiceHook';
import { renderHook } from '@testing-library/react-hooks'
import { render } from "@testing-library/react";
import wfetch from '../wfetch'

jest.mock('../wfetch.ts')

test("should send request to /api endpoint", async () => {
    wfetch.mockResolvedValue({data: ['data']}) 

    const { result, waitForNextUpdate } = renderHook(() => useRemoteService([]));

    await waitForNextUpdate();
    
    expect(wfetch).toBeCalledWith('/api/footprint')
    expect(result.current).toEqual({
        data: ['data'], loading: false, error: false
    })
});

test("should notify of erronous response", async () => {
    wfetch.mockRejectedValue([]) 

    const { result, waitForNextUpdate } = renderHook(() => useRemoteService([]));

    await waitForNextUpdate();
    
    expect(result.current).toEqual({
        data: [], loading: false, error: true
    })
});
