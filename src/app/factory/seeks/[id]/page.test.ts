import { expect, it, vi, beforeEach } from 'vitest';
const mocks=vi.hoisted(()=>({getSeeks:vi.fn(),requireSupplier:vi.fn(),notFound:vi.fn(()=>{throw new Error('NOT_FOUND')})}));
vi.mock('@/shared/api',()=>({getApi:()=>({factory:{getSeeks:mocks.getSeeks}})}));
vi.mock('@/features/auth/require-user',()=>({requireSupplier:mocks.requireSupplier}));
vi.mock('next/navigation',()=>({notFound:mocks.notFound}));
vi.mock('next-intl/server',()=>({getTranslations:async()=> (key:string)=>key}));
vi.mock('@/shared/api/http-api',()=>({mediaThumb:(x:string)=>x}));
import Page from './page';
beforeEach(()=>vi.clearAllMocks());
it('does not turn backend failure into missing resource',async()=>{
 const error=new Error('backend unavailable');mocks.getSeeks.mockRejectedValue(error);
 await expect(Page({params:Promise.resolve({id:'s1'})})).rejects.toBe(error);
 expect(mocks.notFound).not.toHaveBeenCalled();
});
it('retains 404 for genuinely absent private seek',async()=>{
 mocks.getSeeks.mockResolvedValue([]);
 await expect(Page({params:Promise.resolve({id:'missing'})})).rejects.toThrow('NOT_FOUND');
 expect(mocks.requireSupplier).toHaveBeenCalledWith('/factory/seeks/missing');
 expect(mocks.notFound).toHaveBeenCalledOnce();
});
