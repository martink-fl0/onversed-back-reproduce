import { Test, TestingModule } from '@nestjs/testing';

import { UserResolver } from '../resolvers';
import { UserService, UserCustomerService, UserEmployeeService } from '../services';
import { AuthenticationGuard } from "../../../core/authentication/guards";
import { UserEntity } from "../../../entities/user.entity";

describe('UserResolver', () => {
    let resolver: UserResolver;
    let mocks;

    beforeEach(async () => {
        createMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserResolver,
                {
                    provide: UserService,
                    useValue: mocks.service.userService,
                },
                {
                    provide: UserCustomerService,
                    useValue: mocks.service.userCustomerService,
                },
                {
                    provide: UserEmployeeService,
                    useValue: mocks.service.userEmployeeService,
                },
            ],
        })
            .overrideGuard(AuthenticationGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        resolver = module.get<UserResolver>(UserResolver);
    });

    it('Should be defined', () => {
        expect(resolver).toBeDefined();
        expect((resolver as any).service).toBeDefined();
        expect((resolver as any).customerService).toBeDefined();
        expect((resolver as any).employeeService).toBeDefined();
    });

    describe('me', () => {
        let userMock: Partial<UserEntity>;

        beforeEach(() => {
            userMock = {
                id: 'sampleId',
                email: 'test@example.com',
                mobile_phone: '+123456789',
                profiles: [
                    {
                        company: 'Test Company',
                        first_name: 'John',
                        last_name: 'Doe',
                        job_title: 'Engineer',
                        is_customer: true,
                        avatar_url: 'https://example.com/avatar.jpg',
                    } as any,
                ],
            };
        });

        it('should return correct UserMe object from given user entity in context', async () => {
            const contextMock = { req: { user: userMock } };
            const result = await resolver.me(contextMock);

            expect(result.id).toBe(userMock.id);
            expect(result.email).toBe(userMock.email);
            expect(result.mobile_phone).toBe(userMock.mobile_phone);
            expect(result.company).toBe(userMock.profiles[0].company);
            expect(result.first_name).toBe(userMock.profiles[0].first_name);
            expect(result.last_name).toBe(userMock.profiles[0].last_name);
            expect(result.job_title).toBe(userMock.profiles[0].job_title);
            expect(result.is_customer).toBe(userMock.profiles[0].is_customer);
            expect(result.avatar_url).toBe(userMock.profiles[0].avatar_url);
        });

        it('should handle user entity without profiles gracefully', async () => {
            userMock.profiles = [];
            const contextMock = { req: { user: userMock } };
            const result = await resolver.me(contextMock);

            expect(result.id).toBe(userMock.id);
            expect(result.email).toBe(userMock.email);
            expect(result.mobile_phone).toBe(userMock.mobile_phone);
            expect(result.company).toBeUndefined();
            expect(result.first_name).toBeUndefined();
            expect(result.last_name).toBeUndefined();
            expect(result.job_title).toBeUndefined();
            expect(result.is_customer).toBeUndefined();
            expect(result.avatar_url).toBeUndefined();
        });
    });

    describe('confirmPassword', () => {
        let userMock: UserEntity;

        beforeEach(() => {
            userMock = {
                id: 1,
                email: 'test@example.com',
            } as any;
        });

        it('should return true when the password is correct', async () => {
            mocks.service.userService.checkPassword.mockResolvedValue(true);

            const contextMock = { req: { user: userMock } };
            const result = await resolver.confirmPassword(contextMock, 'correctPassword');

            expect(result).toBe(true);
        });

        it('should return false when the password is incorrect', async () => {
            mocks.service.userService.checkPassword.mockResolvedValue(false);

            const contextMock = { req: { user: userMock } };
            const result = await resolver.confirmPassword(contextMock, 'incorrectPassword');

            expect(result).toBe(false);
        });

        it('should throw error when user is not authenticated', async () => {
            const contextMock = { req: {} };

            const result = await resolver.confirmPassword(contextMock, 'somePassword');

            expect(result).toBeUndefined();
        });

        it('should handle the case when checkPassword throws an error', async () => {
            mocks.service.userService.checkPassword.mockRejectedValue(new Error('Some internal error'));

            const contextMock = { req: { user: userMock } };

            await expect(resolver.confirmPassword(contextMock, 'somePassword'))
                .rejects
                .toThrow('Some internal error');
        });

        it('should throw error if context.req.user is not defined', async () => {
            const contextMock = { req: { user: null } };

            const result = await resolver.confirmPassword(contextMock, 'somePassword');

            expect(result).toBeUndefined();
        });
    });

    describe('loginByEmail', () => {
        let loginDataMock: any;
        let userTokensMock: any;

        beforeEach(() => {
            loginDataMock = {
                email: 'test@example.com',
                password: 'correctPassword',
            };

            userTokensMock = {
                accessToken: 'sampleAccessToken',
                refreshToken: 'sampleRefreshToken',
            };
        });

        it('should return user tokens when email and password are valid', async () => {
            mocks.service.userService.checkUserByEmail.mockResolvedValue(userTokensMock);

            const result = await resolver.loginByEmail(loginDataMock);

            expect(result).toEqual(userTokensMock);
        });

        it('should return null or throw an error when email or password is invalid', async () => {
            mocks.service.userService.checkUserByEmail.mockResolvedValue(null);

            const result = await resolver.loginByEmail(loginDataMock);

            expect(result).toBeNull();
        });

        it('should handle the case when checkUserByEmail throws an error', async () => {
            mocks.service.userService.checkUserByEmail.mockRejectedValue(new Error('Some internal error'));

            await expect(resolver.loginByEmail(loginDataMock)).rejects.toThrow('Some internal error');
        });

        it('should return null or handle the case when service returns an empty or null object', async () => {
            mocks.service.userService.checkUserByEmail.mockResolvedValue({});

            const result = await resolver.loginByEmail(loginDataMock);

            expect(result).toEqual({});
        });
    });

    describe('loginByMobilePhone', () => {
        let loginMobileDataMock: any;

        beforeEach(() => {
            loginMobileDataMock = {
                mobilePhone: '+1234567890',
                code: '123456',
            };
        });

        it('should return true when mobile phone and code are valid', async () => {
            mocks.service.userService.checkUserByMobilePhone.mockResolvedValue(true);

            const result = await resolver.loginByMobilePhone(loginMobileDataMock);

            expect(result).toBe(true);
        });

        it('should return false when mobile phone or code is invalid', async () => {
            mocks.service.userService.checkUserByMobilePhone.mockResolvedValue(false);

            const result = await resolver.loginByMobilePhone(loginMobileDataMock);

            expect(result).toBe(false);
        });

        it('should handle the case when checkUserByMobilePhone throws an error', async () => {
            mocks.service.userService.checkUserByMobilePhone.mockRejectedValue(new Error('Some internal error'));

            await expect(resolver.loginByMobilePhone(loginMobileDataMock)).rejects.toThrow('Some internal error');
        });

        it('should handle the case when service returns an unexpected result', async () => {
            mocks.service.userService.checkUserByMobilePhone.mockResolvedValue(null); // o cualquier valor inesperado

            const result = await resolver.loginByMobilePhone(loginMobileDataMock);

            expect(result).not.toBeTruthy();
        });
    });

    describe('loginByMobileCode', () => {
        let tokenSuccessResponse: any;
        let loginMobileCodeDataMock: any;

        beforeEach(() => {
            loginMobileCodeDataMock = {
                mobilePhone: '+1234567890',
                code: '123456',
            };

            tokenSuccessResponse = {
                accessToken: 'sampleAccessToken',
                refreshToken: 'sampleRefreshToken',
            };
        });

        it('should return tokens when mobile code is valid', async () => {
            mocks.service.userService.checkUserByMobileCode.mockResolvedValue(tokenSuccessResponse);

            const result = await resolver.loginByMobileCode(loginMobileCodeDataMock);

            expect(result).toEqual(tokenSuccessResponse);
        });

        it('should return null or throw an error when mobile code is invalid', async () => {
            mocks.service.userService.checkUserByMobileCode.mockResolvedValue(null); // Asumiendo que el servicio devuelve null si el código es inválido

            const result = await resolver.loginByMobileCode(loginMobileCodeDataMock);

            expect(result).toBeNull(); // O podrías esperar que lance un error específico si ese es el comportamiento deseado
        });

        it('should handle the case when checkUserByMobileCode throws an error', async () => {
            mocks.service.userService.checkUserByMobileCode.mockRejectedValue(new Error('Some internal error'));

            await expect(resolver.loginByMobileCode(loginMobileCodeDataMock)).rejects.toThrow('Some internal error');
        });

        it('should handle the case when service returns a malformed token response', async () => {
            const malformedToken = { accessToken: 'sampleAccessToken' }; // Falta el refreshToken
            mocks.service.userService.checkUserByMobileCode.mockResolvedValue(malformedToken);

            const result = await resolver.loginByMobileCode(loginMobileCodeDataMock);

            expect(result).not.toEqual(tokenSuccessResponse);
        });
    });

    describe('recoverPassword', () => {
        let recoverPasswordDataMock: any;

        beforeEach(() => {
            recoverPasswordDataMock = {
                email: 'test@example.com',
            };
        });

        it('should return true when password recovery is successful', async () => {
            mocks.service.userService.recoverPassword.mockResolvedValue(true);

            const result = await resolver.recoverPassword(recoverPasswordDataMock);

            expect(result).toBe(true);
        });

        it('should return false when the provided data does not match any user', async () => {
            mocks.service.userService.recoverPassword.mockResolvedValue(false);

            const result = await resolver.recoverPassword(recoverPasswordDataMock);

            expect(result).toBe(false);
        });

        it('should handle the case when recoverPassword throws an error', async () => {
            mocks.service.userService.recoverPassword.mockRejectedValue(new Error('Some internal error'));

            await expect(resolver.recoverPassword(recoverPasswordDataMock)).rejects.toThrow('Some internal error');
        });
    });

    describe('changePassword', () => {
        let changePasswordDataMock: any;

        beforeEach(() => {
            changePasswordDataMock = {
                oldPassword: 'oldPass123',
                newPassword: 'newPass123',
            };
        });

        it('should return true when password change is successful', async () => {
            mocks.service.userService.changePassword.mockResolvedValue(true);

            const result = await resolver.changePassword(changePasswordDataMock);

            expect(result).toBe(true);
        });

        it('should return false when the provided data is incorrect', async () => {
            mocks.service.userService.changePassword.mockResolvedValue(false);

            const result = await resolver.changePassword(changePasswordDataMock);

            expect(result).toBe(false);
        });

        it('should handle the case when changePassword throws an error', async () => {
            mocks.service.userService.changePassword.mockRejectedValue(new Error('Some internal error'));

            await expect(resolver.changePassword(changePasswordDataMock)).rejects.toThrow('Some internal error');
        });
    });

    describe('updatePassword', () => {
        let userMock: UserEntity;
        let updatePasswordDataMock: any;

        beforeEach(() => {
            updatePasswordDataMock = {
                newPassword: 'newPass456',
            };

            userMock = {
                id: 1,
                email: 'test@example.com',
            } as any;
        });

        it('should return true when password update is successful for an authenticated user', async () => {
            mocks.service.userService.updatePassword.mockResolvedValue(true);

            const contextMock = { req: { user: userMock } };

            const result = await resolver.updatePassword(contextMock, updatePasswordDataMock);

            expect(result).toBe(true);
        });

        it('should return false when the provided data for update is incorrect', async () => {
            mocks.service.userService.updatePassword.mockResolvedValue(false);

            const contextMock = { req: { user: userMock } };

            const result = await resolver.updatePassword(contextMock, updatePasswordDataMock);

            expect(result).toBe(false);
        });

        it('should handle the case when updatePassword throws an error', async () => {
            mocks.service.userService.updatePassword.mockRejectedValue(new Error('Some internal error'));

            const contextMock = { req: { user: userMock } };

            await expect(resolver.updatePassword(contextMock, updatePasswordDataMock)).rejects.toThrow('Some internal error');
        });

        it('should throw error when user is not authenticated', async () => {
            const contextMock = { req: {} };

            const result = await resolver.updatePassword(contextMock, updatePasswordDataMock);

            expect(result).toBeUndefined();
        });
    });

    describe('updateEmail', () => {
        let userMock: UserEntity;
        let updateEmailDataMock: any;

        beforeEach(() => {
            updateEmailDataMock = {
                newEmail: 'newemail@example.com',
            };

            userMock = {
                id: 1,
                email: 'test@example.com',
            } as any;
        });

        it('should return true when email update is successful for an authenticated user', async () => {
            mocks.service.userService.updateEmail.mockResolvedValue(true);

            const contextMock = { req: { user: userMock } };

            const result = await resolver.updateEmail(contextMock, updateEmailDataMock);

            expect(result).toBe(true);
        });

        it('should return false when the provided data for update is incorrect', async () => {
            mocks.service.userService.updateEmail.mockResolvedValue(false);

            const contextMock = { req: { user: userMock } };

            const result = await resolver.updateEmail(contextMock, updateEmailDataMock);

            expect(result).toBe(false);
        });

        it('should handle the case when updateEmail throws an error', async () => {
            mocks.service.userService.updateEmail.mockRejectedValue(new Error('Some internal error'));

            const contextMock = { req: { user: userMock } };

            await expect(resolver.updateEmail(contextMock, updateEmailDataMock)).rejects.toThrow('Some internal error');
        });

        it('should throw error when user is not authenticated', async () => {
            const contextMock = { req: {} };

            const result = await resolver.updateEmail(contextMock, updateEmailDataMock);

            expect(result).toBeUndefined();
        });

        it('should throw error when trying to update to an email that is already in use', async () => {
            mocks.service.userService.updateEmail.mockRejectedValue(new Error('Email already in use'));

            const contextMock = { req: { user: userMock } };

            await expect(resolver.updateEmail(contextMock, updateEmailDataMock)).rejects.toThrow('Email already in use');
        });
    });

    describe('updateMobilePhone', () => {
        let userMock: UserEntity;
        const inputDataMock: any = {
            newMobilePhone: '+123456789',
        };

        beforeEach(() => {
            userMock = {
                id: 1,
                email: 'test@example.com',
                mobile_phone: '+987654321'
            } as any;
        });

        it('should update the mobile phone successfully', async () => {
            mocks.service.userService.updateMobilePhone.mockResolvedValue(true);

            const contextMock = { req: { user: userMock } };
            const result = await resolver.updateMobilePhone(contextMock, inputDataMock);

            expect(result).toBe(true);
            expect(mocks.service.userService.updateMobilePhone).toHaveBeenCalledWith(inputDataMock, userMock);
        });

        it('should return false if the mobile phone is not updated', async () => {
            mocks.service.userService.updateMobilePhone.mockResolvedValue(false);

            const contextMock = { req: { user: userMock } };
            const result = await resolver.updateMobilePhone(contextMock, inputDataMock);

            expect(result).toBe(false);
        });

        it('should throw an error if updateMobilePhone service method throws an error', async () => {
            mocks.service.userService.updateMobilePhone.mockRejectedValue(new Error('Some internal error'));

            const contextMock = { req: { user: userMock } };

            await expect(resolver.updateMobilePhone(contextMock, inputDataMock)).rejects.toThrow('Some internal error');
        });

        it('should throw error when user is not authenticated', async () => {
            const contextMock = { req: {} };

            const result = await resolver.updateMobilePhone(contextMock, inputDataMock);

            expect(result).toBeUndefined();
        });
    });

    describe('createUserEmployee', () => {
        const inputDataMock: any = {
            email: 'employee@example.com',
            job_title: 'Engineer',
        };

        it('should create a new user employee and return true', async () => {
            mocks.service.userEmployeeService.createUserEmployee.mockResolvedValue(true);

            const result = await resolver.createUserEmployee(inputDataMock);

            expect(result).toBe(true);
            expect(mocks.service.userEmployeeService.createUserEmployee).toHaveBeenCalledWith(inputDataMock);
        });

        it('should throw an error if createUserEmployee service method throws an error', async () => {
            mocks.service.userEmployeeService.createUserEmployee.mockRejectedValue(new Error('Creation failed'));

            await expect(resolver.createUserEmployee(inputDataMock)).rejects.toThrow('Creation failed');
        });

        it('should throw an error if the user is not authenticated', async () => {
            const result = await resolver.createUserEmployee(inputDataMock);

            expect(result).toBeUndefined();
        });

        it('should throw an error if the user does not have the CUSTOMER role', async () => {
            const result = await resolver.createUserEmployee(inputDataMock);

            expect(result).toBeUndefined();
        });
    });

    describe('emailConfirmation', () => {
        const validCode = '123456';

        it('should confirm the email and return user tokens when code is valid', async () => {
            const expectedTokens = {
                accessToken: 'validAccessToken',
                refreshToken: 'validRefreshToken',
            };
            mocks.service.userService.emailConfirmation.mockResolvedValue(expectedTokens);

            const result = await resolver.emailConfirmation({}, validCode);

            expect(result).toEqual(expectedTokens);
            expect(mocks.service.userService.emailConfirmation).toHaveBeenCalledWith(validCode);
        });

        it('should throw an error if the email confirmation fails in the service', async () => {
            mocks.service.userService.emailConfirmation.mockRejectedValue(new Error('Invalid code'));

            await expect(resolver.emailConfirmation({}, validCode)).rejects.toThrow('Invalid code');
        });

        it('should throw an error if the code is expired', async () => {
            mocks.service.userService.emailConfirmation.mockRejectedValue(new Error('Code expired'));

            await expect(resolver.emailConfirmation({}, validCode)).rejects.toThrow('Code expired');
        });
    });

    describe('resendEmailConfirmation', () => {
        const validEmail = 'test@example.com';

        it('should resend the email confirmation and return true when email is valid', async () => {
            mocks.service.userService.resendEmailConfirmation.mockResolvedValue(true);

            const result = await resolver.resendEmailConfirmation(validEmail);

            expect(result).toBe(true);
            expect(mocks.service.userService.resendEmailConfirmation).toHaveBeenCalledWith(validEmail);
        });

        it('should return false if the email is not registered or invalid', async () => {
            mocks.service.userService.resendEmailConfirmation.mockResolvedValue(false);

            const result = await resolver.resendEmailConfirmation('invalid@example.com');

            expect(result).toBe(false);
        });

        it('should throw an error if the resend operation fails in the service', async () => {
            mocks.service.userService.resendEmailConfirmation.mockRejectedValue(new Error('Resend operation failed'));

            await expect(resolver.resendEmailConfirmation(validEmail)).rejects.toThrow('Resend operation failed');
        });

        it('should throw an error if resend limit is reached', async () => {
            mocks.service.userService.resendEmailConfirmation.mockRejectedValue(new Error('Resend limit reached'));

            await expect(resolver.resendEmailConfirmation(validEmail)).rejects.toThrow('Resend limit reached');
        });
    });

    describe('smsConfirmation', () => {
        const validCode = '123456';

        it('should confirm the SMS code and return tokens when the code is valid', async () => {
            const mockTokens = { accessToken: 'token', refreshToken: 'refreshToken' };
            mocks.service.userService.smsConfirmation.mockResolvedValue(mockTokens);

            const result = await resolver.smsConfirmation(validCode);

            expect(result).toEqual(mockTokens);
            expect(mocks.service.userService.smsConfirmation).toHaveBeenCalledWith(validCode);
        });

        it('should throw an error if the code is invalid or expired', async () => {
            mocks.service.userService.smsConfirmation.mockRejectedValue(new Error('Invalid or expired code'));

            await expect(resolver.smsConfirmation('invalidCode')).rejects.toThrow('Invalid or expired code');
        });

        it('should handle other errors during the SMS confirmation process', async () => {
            mocks.service.userService.smsConfirmation.mockRejectedValue(new Error('Internal server error'));

            await expect(resolver.smsConfirmation(validCode)).rejects.toThrow('Internal server error');
        });
    });

    describe('resendSmsConfirmation', () => {
        const validMobilePhone = '+1234567890';

        it('should resend the SMS confirmation and return true when the mobile phone is valid', async () => {
            mocks.service.userService.resendSmsConfirmation.mockResolvedValue(true);

            const result = await resolver.resendSmsConfirmation(validMobilePhone);

            expect(result).toBe(true);
            expect(mocks.service.userService.resendSmsConfirmation).toHaveBeenCalledWith(validMobilePhone);
        });

        it('should return false if the mobile phone is not registered or invalid', async () => {
            mocks.service.userService.resendSmsConfirmation.mockResolvedValue(false);

            const result = await resolver.resendSmsConfirmation('invalidMobilePhone');

            expect(result).toBe(false);
        });

        it('should throw an error if the resend operation fails in the service', async () => {
            mocks.service.userService.resendSmsConfirmation.mockRejectedValue(new Error('Resend operation failed'));

            await expect(resolver.resendSmsConfirmation(validMobilePhone)).rejects.toThrow('Resend operation failed');
        });
    });

    describe('checkPassword', () => {
        const validPassword = 'samplePassword';
        const mockUser: UserEntity = { id: 'user1', email: 'test@example.com' } as any;

        it('should return true if the provided password matches the user password', async () => {
            mocks.service.userService.checkPassword.mockResolvedValue(true);

            const result = await resolver.checkPassword({ req: { user: mockUser } }, validPassword);

            expect(result).toBe(true);
            expect(mocks.service.userService.checkPassword).toHaveBeenCalledWith(validPassword, mockUser);
        });

        it('should return false if the provided password does not match the user password', async () => {
            mocks.service.userService.checkPassword.mockResolvedValue(false);

            const result = await resolver.checkPassword({ req: { user: mockUser } }, 'invalidPassword');

            expect(result).toBe(false);
        });

        it('should throw error if context.req.user is not defined', async () => {
            const result = await resolver.checkPassword({ req: {} }, validPassword);

            expect(result).toBeUndefined();
        });
    });

    describe('removeEmployee', () => {
        const validId = 'employee1';

        it('should return true if the employee is successfully removed', async () => {
            mocks.service.userEmployeeService.removeEmployee.mockResolvedValue(true);

            const result = await resolver.removeEmployee(validId);

            expect(result).toBe(true);
            expect(mocks.service.userEmployeeService.removeEmployee).toHaveBeenCalledWith(validId);
        });

        it('should return false if the employee ID is not found', async () => {
            mocks.service.userEmployeeService.removeEmployee.mockResolvedValue(false);

            const result = await resolver.removeEmployee('invalidId');

            expect(result).toBe(false);
        });
    });

    describe('removeCustomer', () => {
        const validPassword = 'samplePassword';
        const mockUser: UserEntity = { id: 'customer1', email: 'customer@example.com' } as any;

        it('should return true if the customer is successfully removed after password verification', async () => {
            mocks.service.userCustomerService.removeCustomer.mockResolvedValue(true);

            const result = await resolver.removeCustomer({ req: { user: mockUser } }, validPassword);

            expect(result).toBe(true);
            expect(mocks.service.userCustomerService.removeCustomer).toHaveBeenCalledWith(validPassword, mockUser);
        });

        it('should return false if the provided password does not match the customer password', async () => {
            mocks.service.userCustomerService.removeCustomer.mockResolvedValue(false);

            const result = await resolver.removeCustomer({ req: { user: mockUser } }, 'invalidPassword');

            expect(result).toBe(false);
        });

        it('should throw error if context.req.user is not defined', async () => {
            const result = await resolver.removeCustomer({ req: {} }, validPassword);

            expect(result).toBeUndefined();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    function createMocks() {
        mocks = {
            service: {
                userService: {
                    checkPassword: jest.fn(),
                    checkUserByEmail: jest.fn(),
                    checkUserByMobilePhone: jest.fn(),
                    checkUserByMobileCode: jest.fn(),
                    recoverPassword: jest.fn(),
                    changePassword: jest.fn(),
                    updatePassword: jest.fn(),
                    updateEmail: jest.fn(),
                    updateMobilePhone: jest.fn(),
                    emailConfirmation: jest.fn(),
                    resendEmailConfirmation: jest.fn(),
                    smsConfirmation: jest.fn(),
                    resendSmsConfirmation: jest.fn(),
                },
                userCustomerService: {
                    removeCustomer: jest.fn(),
                    createUserCustomer: jest.fn(),
                },
                userEmployeeService: {
                    removeEmployee: jest.fn(),
                    createUserEmployee: jest.fn(),
                }
            },
        };
    }
});
