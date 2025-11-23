import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './providers/cart.service';
import { Auth } from 'src/auth/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Add to cart',
    description: 'Memasukan item buku ke keranjang',
  })
  add(@CurrentUser() user: TokenPayload, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get all cart item',
    description: 'Menampilkan list semua pesanan yang ada di dalam keranjang',
  })
  list(@CurrentUser() user: TokenPayload) {
    return this.cartService.getCart(user);
  }

  @Patch(':itemId')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Get cart item',
    description:
      'Menampilkan satu { itemId } pesanan yang ada di dalam keranjang',
  })
  update(
    @CurrentUser() user: TokenPayload,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(user, itemId, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Remove cart item',
    description:
      'Menghapus satu { itemId } pesanan yang ada di dalam keranjang',
  })
  remove(@CurrentUser() user: TokenPayload, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user, itemId);
  }
}
