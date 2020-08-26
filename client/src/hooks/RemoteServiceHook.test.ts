import React from "react";
import useRemoteService from './RemoteServiceHook';
import { renderHook } from '@testing-library/react-hooks'
import { render } from "@testing-library/react";


test("should return empty initial state", () => {
    const { result } = renderHook(() => useRemoteService([]));
    
    expect(result.current).toEqual({
        data: [], loading: false, error: false
    })
});
