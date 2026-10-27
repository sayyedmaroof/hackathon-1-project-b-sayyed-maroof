import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/session', () => ({
  requireVerifiedUser: vi.fn(async () => ({
    id: 'user-abc',
    email: 'a@b.com',
    name: 'Test',
    emailVerifiedAt: new Date(),
  })),
}))

const deleteMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) })
const insertMock = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })

vi.mock('@/lib/db', () => ({
  db: {
    delete: deleteMock,
    insert: insertMock,
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('saveWallet user scoping', () => {
  it('deletes and inserts only for session user id', async () => {
    const { saveWallet } = await import('@/app/actions/wallet')
    deleteMock.mockClear()
    insertMock.mockClear()

    await saveWallet({ cards: [{ cardId: 'iberia_icon', revolutPlan: null }] })

    expect(deleteMock).toHaveBeenCalled()
    const whereFn = deleteMock.mock.results[0]?.value?.where
    expect(whereFn).toHaveBeenCalled()
    const insertValues = insertMock.mock.results[0]?.value?.values
    expect(insertValues).toHaveBeenCalledWith([
      expect.objectContaining({ userId: 'user-abc', cardId: 'iberia_icon' }),
    ])
  })
})
